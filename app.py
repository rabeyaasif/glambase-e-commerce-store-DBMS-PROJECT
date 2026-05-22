from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="rabeya3569@",
        database="glambase"
    )

@app.route("/")
def home():
    return "Backend Connected!"

@app.route("/products")
def get_products():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.product_id, p.product_name, p.description, p.base_price,
               b.brand_name, c.category_name
        FROM products p
        JOIN brands b ON b.brand_id = p.brand_id
        JOIN categories c ON c.category_id = p.category_id
        WHERE p.is_active = 1
    """)
    result = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(result)

@app.route("/stats")
def get_stats():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT COUNT(*) as count FROM products")
    products = cursor.fetchone()["count"]
    cursor.execute("SELECT COUNT(*) as count FROM brands")
    brands = cursor.fetchone()["count"]
    cursor.execute("SELECT COUNT(*) as count FROM categories")
    categories = cursor.fetchone()["count"]
    cursor.execute("SELECT COUNT(*) as count FROM orders")
    orders = cursor.fetchone()["count"]
    cursor.execute("SELECT COUNT(*) as count FROM customers")
    customers = cursor.fetchone()["count"]
    cursor.close()
    db.close()
    return jsonify({
        "products": products,
        "brands": brands,
        "categories": categories,
        "orders": orders,
        "customers": customers,
        "status": "connected"
    })

@app.route("/brands")
def get_brands():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM brands")
    result = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(result)

@app.route("/categories")
def get_categories():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM categories")
    result = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(result)

@app.route("/place_order", methods=["POST"])
def place_order():
    data = request.get_json()
    db = get_db()
    cursor = db.cursor(dictionary=True)

    try:
        # Insert into orders table using customer 1 (Sara Qureshi) by default
        cursor.execute("""
            INSERT INTO orders (customer_id, address_id, subtotal, tax_amt, shipping_amt, total_amt, order_status)
            VALUES (%s, %s, %s, %s, %s, %s, 'pending')
        """, (
            1,
            1,
            data["subtotal"],
            data["tax"],
            data["shipping"],
            data["total"]
        ))
        order_id = cursor.lastrowid

        # Insert each cart item into order_items
        for item in data["items"]:
            cursor.execute("""
                SELECT ps_id, stock_qty FROM product_shades
                WHERE product_id = %s LIMIT 1
            """, (item["product_id"],))
            shade = cursor.fetchone()

            if shade and shade["stock_qty"] >= item["qty"]:
                cursor.execute("""
                    INSERT INTO order_items (order_id, ps_id, quantity, unit_price, line_total)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    order_id,
                    shade["ps_id"],
                    item["qty"],
                    item["price"],
                    item["qty"] * item["price"]
                ))
                # Deduct stock
                cursor.execute("""
                    UPDATE product_shades SET stock_qty = stock_qty - %s WHERE ps_id = %s
                """, (item["qty"], shade["ps_id"]))

        # Insert payment record — setting status to 'completed' fires the trigger
        # which awards GlamPoints and updates customer tier automatically
        cursor.execute("""
            INSERT INTO payments (order_id, method, amount_paid, status, paid_at)
            VALUES (%s, %s, %s, 'completed', NOW())
        """, (
            order_id,
            data.get("payment_method", "Cash on Delivery"),
            data["total"]
        ))

        db.commit()
        return jsonify({
            "success": True,
            "order_id": order_id,
            "message": "Order placed successfully!"
        })

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        cursor.close()
        db.close()

if __name__ == "__main__":
    app.run(debug=True)