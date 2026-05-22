import { useState, useEffect } from "react";

const CATEGORIES = ["All", "Lipstick", "Lip Gloss", "Foundation", "Blush", "Eyes"];
const BRANDS = ["Huda Beauty", "Charlotte Tilbury", "L.A. Girl", "Medora", "Rivaj UK", "NYX Professional"];

const PRODUCT_IMAGES = {
  "Power Bullet Lipstick":  "https://images.unsplash.com/photo-1586495777744-4e6232bf2082?w=400&q=80",
  "Pillow Lips Gloss":      "https://images.unsplash.com/photo-1631214498981-8f2e0f5b9f45?w=400&q=80",
  "Pro HD Foundation":      "https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&q=80",
  "Flawless Finish Base":   "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80",
  "Glow Blush Duo":         "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
  "Mega Lash Mascara":      "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&q=80",
  "Intense Kohl Liner":     "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80",
  "Velvet Matte Lipstick":  "https://images.unsplash.com/photo-1586495777744-4e6232bf2082?w=400&q=80",
};

const PRODUCT_BADGES = {
  "Power Bullet Lipstick": "Bestseller",
  "Pillow Lips Gloss":     "New",
  "Flawless Finish Base":  "Luxury",
  "Velvet Matte Lipstick": "Local Love",
};

function StarRating({ rating }) {
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= Math.round(rating || 4) ? "#e8a0a0" : "#ddd", fontSize: 13 }}>★</span>
      ))}
      <span style={{ fontSize: 12, color: "#999", marginLeft: 4 }}>{rating || "4.5"}</span>
    </div>
  );
}

function Badge({ text }) {
  if (!text) return null;
  const colors = {
    "Bestseller": { bg: "#fde8e8", color: "#c0392b" },
    "New":        { bg: "#e8f4fd", color: "#2980b9" },
    "Luxury":     { bg: "#f8e8fd", color: "#8e44ad" },
    "Local Love": { bg: "#e8fde8", color: "#27ae60" },
  };
  const c = colors[text] || { bg: "#f0f0f0", color: "#555" };
  return (
    <span style={{
      background: c.bg, color: c.color,
      fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
      padding: "3px 8px", borderRadius: 20,
      textTransform: "uppercase"
    }}>{text}</span>
  );
}

function ProductCard({ product, onAddToCart, onView }) {
  const [hovered, setHovered] = useState(false);
  const img = PRODUCT_IMAGES[product.product_name] || PRODUCT_IMAGES[product.name] || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80";
  const name = product.product_name || product.name;
  const brand = product.brand_name || product.brand;
  const price = product.base_price || product.price;
  const desc = product.description || product.desc;
  const badge = PRODUCT_BADGES[name] || product.badge || "";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white", borderRadius: 20, overflow: "hidden",
        boxShadow: hovered ? "0 12px 40px rgba(200,120,120,0.18)" : "0 2px 16px rgba(0,0,0,0.07)",
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-4px)" : "none",
        cursor: "pointer"
      }}
    >
      <div style={{ position: "relative" }}>
        <img src={img} alt={name}
          style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80"; }}
        />
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <Badge text={badge} />
        </div>
        <button onClick={() => onView(product)} style={{
          position: "absolute", top: 10, right: 10,
          background: "rgba(255,255,255,0.9)", border: "none",
          borderRadius: "50%", width: 34, height: 34,
          cursor: "pointer", fontSize: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
        }}>🔍</button>
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ fontSize: 11, color: "#e8a0a0", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{brand}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#333", marginBottom: 4, lineHeight: 1.3 }}>{name}</div>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 8, lineHeight: 1.4 }}>{desc}</div>
        <StarRating rating={4.5} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#c0392b" }}>
            PKR {Number(price).toLocaleString()}
          </div>
          <button onClick={() => onAddToCart(product)} style={{
            background: "linear-gradient(135deg, #e8a0a0, #c0392b)",
            color: "white", border: "none",
            borderRadius: 12, padding: "8px 16px",
            fontSize: 13, fontWeight: 600,
            cursor: "pointer"
          }}>Add to Bag</button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cart, onClose, onRemove, onCheckout, checkingOut }) {
  const total = cart.reduce((s, i) => s + Number(i.base_price || i.price) * i.qty, 0);
  const tax = Math.round(total * 0.17);
  const shipping = total > 2000 ? 0 : 200;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex" }}>
      <div onClick={onClose} style={{ flex: 1, background: "rgba(0,0,0,0.35)" }} />
      <div style={{ width: 360, background: "white", height: "100%", display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f5e8e8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#333" }}>✨ My Glam Bag</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#aaa" }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#ccc" }}>
              <div style={{ fontSize: 50, marginBottom: 16 }}>💄</div>
              <div style={{ fontSize: 16 }}>Your bag is empty!</div>
              <div style={{ fontSize: 13, marginTop: 8, color: "#ddd" }}>Add some glam 💕</div>
            </div>
          ) : cart.map(item => (
            <div key={item.product_id || item.id} style={{ display: "flex", gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #faf0f0" }}>
              <img src={PRODUCT_IMAGES[item.product_name || item.name] || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80"}
                alt={item.product_name || item.name}
                style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover" }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{item.product_name || item.name}</div>
                <div style={{ fontSize: 11, color: "#e8a0a0" }}>{item.brand_name || item.brand}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#c0392b" }}>PKR {Number(item.base_price || item.price).toLocaleString()}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "#999" }}>Qty: {item.qty}</span>
                    <button onClick={() => onRemove(item.product_id || item.id)} style={{ background: "none", border: "none", color: "#ddd", cursor: "pointer", fontSize: 16 }}>🗑</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div style={{ padding: "16px 24px 24px", borderTop: "1px solid #f5e8e8" }}>
            <div style={{ fontSize: 13, color: "#999", marginBottom: 4 }}>
              {shipping === 0 ? "✅ Free shipping!" : `Standard shipping: PKR ${shipping}`}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13, color: "#888" }}>
              <span>Subtotal</span><span>PKR {total.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#888" }}>
              <span>GST (17%)</span><span>PKR {tax.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 17, fontWeight: 700, color: "#333" }}>
              <span>Total</span><span>PKR {(total + tax + shipping).toLocaleString()}</span>
            </div>
            <button
              onClick={onCheckout}
              disabled={checkingOut}
              style={{
                width: "100%", background: checkingOut ? "#e8a0a0" : "linear-gradient(135deg, #e8a0a0, #c0392b)",
                color: "white", border: "none", borderRadius: 14,
                padding: "14px", fontSize: 15, fontWeight: 700,
                cursor: checkingOut ? "not-allowed" : "pointer"
              }}
            >
              {checkingOut ? "Placing Order... ⏳" : "Checkout 💕"}
            </button>
            <div style={{ textAlign: "center", fontSize: 12, color: "#ccc", marginTop: 10 }}>
              EasyPaisa · JazzCash · Cash on Delivery
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductModal({ product, onClose, onAddToCart }) {
  const img = PRODUCT_IMAGES[product.product_name || product.name] || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80";
  const name = product.product_name || product.name;
  const brand = product.brand_name || product.brand;
  const price = product.base_price || product.price;
  const desc = product.description || product.desc;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "white", borderRadius: 24, maxWidth: 560, width: "100%",
        overflow: "hidden", maxHeight: "90vh", overflowY: "auto"
      }}>
        <div style={{ position: "relative" }}>
          <img src={img} alt={name} style={{ width: "100%", height: 260, objectFit: "cover" }}
            onError={e => { e.target.src = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80"; }}
          />
          <button onClick={onClose} style={{
            position: "absolute", top: 16, right: 16,
            background: "rgba(255,255,255,0.9)", border: "none",
            borderRadius: "50%", width: 36, height: 36, fontSize: 18, cursor: "pointer"
          }}>×</button>
        </div>
        <div style={{ padding: 28 }}>
          <div style={{ fontSize: 12, color: "#e8a0a0", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{brand}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#333", marginBottom: 8 }}>{name}</div>
          <StarRating rating={4.5} />
          <div style={{ fontSize: 14, color: "#666", lineHeight: 1.7, marginBottom: 20, marginTop: 12 }}>{desc}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#c0392b" }}>PKR {Number(price).toLocaleString()}</div>
            <button onClick={() => { onAddToCart(product); onClose(); }} style={{
              background: "linear-gradient(135deg, #e8a0a0, #c0392b)",
              color: "white", border: "none", borderRadius: 14,
              padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer"
            }}>Add to Bag 💄</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toast({ msg }) {
  return (
    <div style={{
      position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)",
      background: "#c0392b", color: "white",
      padding: "12px 28px", borderRadius: 50,
      fontSize: 14, fontWeight: 600,
      boxShadow: "0 8px 30px rgba(192,57,43,0.4)",
      zIndex: 2000, whiteSpace: "nowrap"
    }}>✅ {msg}</div>
  );
}

function AdvisorCard({ advisor }) {
  return (
    <div style={{ background: "white", borderRadius: 20, padding: 24, textAlign: "center", boxShadow: "0 4px 20px rgba(200,120,120,0.1)" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #f8e8e8, #e8a0a0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 14px" }}>
        {advisor.icon}
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, color: "#333", marginBottom: 4 }}>{advisor.name}</div>
      <div style={{ fontSize: 13, color: "#e8a0a0", marginBottom: 8 }}>{advisor.role}</div>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>{advisor.speciality}</div>
      <button style={{ background: "#fdf0f0", color: "#c0392b", border: "1.5px solid #f5c0c0", borderRadius: 12, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Book Session</button>
    </div>
  );
}

// ─── DATABASE STATUS PAGE ─────────────────────────────────────────────────────
function DatabasePage() {
  const [stats, setStats]       = useState(null);
  const [brands, setBrands]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const BASE = "http://127.0.0.1:5000";

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/stats`).then(r => r.json()),
      fetch(`${BASE}/brands`).then(r => r.json()),
      fetch(`${BASE}/categories`).then(r => r.json()),
      fetch(`${BASE}/products`).then(r => r.json()),
    ])
      .then(([s, b, c, p]) => {
        setStats(s); setBrands(b); setCategories(c); setProducts(p);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const statCards = stats ? [
    { label: "Products",   value: stats.products,   icon: "💄", color: "#c0392b" },
    { label: "Brands",     value: stats.brands,     icon: "🏷️", color: "#8e44ad" },
    { label: "Categories", value: stats.categories, icon: "📂", color: "#2980b9" },
    { label: "Orders",     value: stats.orders,     icon: "📦", color: "#27ae60" },
    { label: "Customers",  value: stats.customers,  icon: "👤", color: "#e67e22" },
  ] : [];

  const apis = [
    { method: "GET",  endpoint: "/products",     desc: "All active products with brand & category" },
    { method: "GET",  endpoint: "/brands",        desc: "All makeup brands" },
    { method: "GET",  endpoint: "/categories",    desc: "All product categories" },
    { method: "GET",  endpoint: "/stats",         desc: "Database record counts" },
    { method: "POST", endpoint: "/place_order",   desc: "Place a new order (saves to DB)" },
  ];

  const tabs = ["overview", "products", "brands", "categories", "apis"];

  return (
    <div style={{ padding: "40px 60px" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: "#2c1810", margin: 0 }}>Database Dashboard 🗄️</h2>
          {!loading && !error && (
            <span style={{ background: "#e8fde8", color: "#27ae60", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, border: "1.5px solid #27ae60" }}>
              ● CONNECTED
            </span>
          )}
          {error && (
            <span style={{ background: "#fde8e8", color: "#c0392b", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, border: "1.5px solid #c0392b" }}>
              ● DISCONNECTED
            </span>
          )}
        </div>
        <p style={{ color: "#aaa", margin: 0, fontSize: 15 }}>
          Live view of your MySQL <strong>glambase</strong> database via Flask API
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: 80, color: "#e8a0a0", fontSize: 18 }}>
          Loading database... 🗄️
        </div>
      )}

      {error && (
        <div style={{ background: "#fff5f5", border: "1.5px solid #fcc", borderRadius: 20, padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#c0392b", marginBottom: 8 }}>Backend not running</div>
          <div style={{ color: "#888", fontSize: 14 }}>Run <code style={{ background: "#f5f5f5", padding: "2px 8px", borderRadius: 6 }}>python app.py</code> in your terminal first</div>
        </div>
      )}

      {!loading && !error && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 36 }}>
            {statCards.map(s => (
              <div key={s.label} style={{ background: "white", borderRadius: 18, padding: "22px 20px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", borderTop: `4px solid ${s.color}` }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                background: activeTab === t ? "linear-gradient(135deg, #e8a0a0, #c0392b)" : "white",
                color: activeTab === t ? "white" : "#888",
                border: "1.5px solid " + (activeTab === t ? "transparent" : "#f5e8e8"),
                borderRadius: 20, padding: "8px 20px",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                textTransform: "capitalize"
              }}>{t}</button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 20, marginTop: 0 }}>🗄️ Database Info</h3>
                {[
                  ["Database Name", "glambase"],
                  ["Host", "localhost"],
                  ["Port", "3306"],
                  ["Engine", "MySQL"],
                  ["Backend", "Flask (Python)"],
                  ["Frontend", "React (Vite)"],
                  ["Status", "✅ Connected"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #fdf5f5", fontSize: 14 }}>
                    <span style={{ color: "#888" }}>{k}</span>
                    <span style={{ fontWeight: 600, color: "#333" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 20, marginTop: 0 }}>📋 Tables in Database</h3>
                {[
                  ["brands", stats.brands + " records"],
                  ["categories", stats.categories + " records"],
                  ["products", stats.products + " records"],
                  ["orders", stats.orders + " records"],
                  ["customers", stats.customers + " records"],
                  ["shades", "shade data"],
                  ["order_items", "order details"],
                  ["staff", "staff accounts"],
                ].map(([t, c]) => (
                  <div key={t} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #fdf5f5", fontSize: 14 }}>
                    <span style={{ color: "#2980b9", fontFamily: "monospace", fontWeight: 600 }}>{t}</span>
                    <span style={{ color: "#aaa", fontSize: 12 }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", overflowX: "auto" }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 20, marginTop: 0 }}>💄 Products Table — {products.length} records</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#fdf5f5" }}>
                    {["ID", "Product Name", "Brand", "Category", "Price (PKR)", "Status"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#888", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={p.product_id} style={{ borderBottom: "1px solid #fdf5f5", background: i % 2 === 0 ? "white" : "#fffbfb" }}>
                      <td style={{ padding: "12px 14px", color: "#bbb", fontSize: 12 }}>#{p.product_id}</td>
                      <td style={{ padding: "12px 14px", fontWeight: 600, color: "#333" }}>{p.product_name}</td>
                      <td style={{ padding: "12px 14px", color: "#e8a0a0" }}>{p.brand_name}</td>
                      <td style={{ padding: "12px 14px", color: "#888" }}>{p.category_name}</td>
                      <td style={{ padding: "12px 14px", color: "#c0392b", fontWeight: 700 }}>PKR {Number(p.base_price).toLocaleString()}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ background: "#e8fde8", color: "#27ae60", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "brands" && (
            <div style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 20, marginTop: 0 }}>🏷️ Brands Table — {brands.length} records</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {brands.map(b => (
                  <div key={b.brand_id} style={{ background: "#fdf8f8", borderRadius: 14, padding: "16px 20px", border: "1.5px solid #fde8e8" }}>
                    <div style={{ fontSize: 11, color: "#bbb", marginBottom: 4 }}>ID: {b.brand_id}</div>
                    <div style={{ fontWeight: 700, color: "#333", fontSize: 15, marginBottom: 4 }}>{b.brand_name}</div>
                    <div style={{ fontSize: 12, color: "#e8a0a0" }}>🌍 {b.country || "—"}</div>
                    {b.website && <div style={{ fontSize: 11, color: "#bbb", marginTop: 4, wordBreak: "break-all" }}>{b.website}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            <div style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 20, marginTop: 0 }}>📂 Categories Table — {categories.length} records</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#fdf5f5" }}>
                    {["ID", "Category Name", "Parent ID", "Description"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#888", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c, i) => (
                    <tr key={c.category_id} style={{ borderBottom: "1px solid #fdf5f5", background: i % 2 === 0 ? "white" : "#fffbfb" }}>
                      <td style={{ padding: "12px 14px", color: "#bbb", fontSize: 12 }}>#{c.category_id}</td>
                      <td style={{ padding: "12px 14px", fontWeight: 600, color: "#333" }}>{c.category_name}</td>
                      <td style={{ padding: "12px 14px", color: "#888" }}>{c.parent_id || <span style={{ color: "#ddd" }}>Root</span>}</td>
                      <td style={{ padding: "12px 14px", color: "#aaa" }}>{c.description || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "apis" && (
            <div style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 20, marginTop: 0 }}>🔗 API Endpoints</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {apis.map(a => (
                  <div key={a.endpoint} style={{ display: "flex", alignItems: "center", gap: 16, background: "#fdf8f8", borderRadius: 14, padding: "16px 20px", border: "1.5px solid #fde8e8" }}>
                    <span style={{
                      background: a.method === "POST" ? "#fde8e8" : "#e8fde8",
                      color: a.method === "POST" ? "#c0392b" : "#27ae60",
                      fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8, minWidth: 40, textAlign: "center"
                    }}>{a.method}</span>
                    <code style={{ fontSize: 14, fontWeight: 700, color: "#2980b9", flex: 1 }}>http://127.0.0.1:5000{a.endpoint}</code>
                    <span style={{ fontSize: 13, color: "#888" }}>{a.desc}</span>
                    {a.method === "GET" && (
                      <a href={`http://127.0.0.1:5000${a.endpoint}`} target="_blank" rel="noreferrer"
                        style={{ background: "#c0392b", color: "white", fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 10, textDecoration: "none" }}>
                        Test →
                      </a>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, background: "#f8f8f8", borderRadius: 14, padding: 20, fontFamily: "monospace", fontSize: 13, color: "#555" }}>
                <div style={{ color: "#aaa", marginBottom: 8, fontSize: 11, fontFamily: "sans-serif", fontWeight: 600 }}>SAMPLE RESPONSE — /products</div>
                {`[\n  {\n    "product_id": 1,\n    "product_name": "Power Bullet Lipstick",\n    "brand_name": "Huda Beauty",\n    "category_name": "Lipstick",\n    "base_price": "2500.00"\n  },\n  ...\n]`}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function GlamBase() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [viewProduct, setViewProduct] = useState(null);
  const [toast, setToast] = useState("");
  const [orderDone, setOrderDone] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/products")
      .then(res => res.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const addToCart = (p) => {
    const id = p.product_id || p.id;
    setCart(prev => {
      const ex = prev.find(i => (i.product_id || i.id) === id);
      if (ex) return prev.map(i => (i.product_id || i.id) === id ? {...i, qty: i.qty + 1} : i);
      return [...prev, {...p, qty: 1}];
    });
    setToast(`${p.product_name || p.name} added to bag!`);
    setTimeout(() => setToast(""), 2500);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => (i.product_id || i.id) !== id));

  // ── REAL CHECKOUT — posts to Flask which saves to MySQL ──
  const handleCheckout = async () => {
    const subtotal = cart.reduce((s, i) => s + Number(i.base_price || i.price) * i.qty, 0);
    const tax = Math.round(subtotal * 0.17);
    const shipping = subtotal > 2000 ? 0 : 200;
    const total = subtotal + tax + shipping;

    setCheckingOut(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/place_order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subtotal,
          tax,
          shipping,
          total,
          payment_method: "Cash on Delivery",
          items: cart.map(i => ({
            product_id: i.product_id || i.id,
            qty: i.qty,
            price: Number(i.base_price || i.price)
          }))
        })
      });

      const result = await res.json();

      if (result.success) {
        setCartOpen(false);
        setCart([]);
        setLastOrderId(result.order_id);
        setOrderDone(true);
        setTimeout(() => setOrderDone(false), 5000);
      } else {
        alert("Order failed: " + result.message);
      }
    } catch (err) {
      alert("Could not connect to backend. Make sure Flask is running.");
    } finally {
      setCheckingOut(false);
    }
  };

  const filtered = products.filter(p => {
    const name = p.product_name || p.name || "";
    const brand = p.brand_name || p.brand || "";
    const category = p.category_name || p.category || "";
    const matchCat = selectedCategory === "All" || category === selectedCategory;
    const matchQ = name.toLowerCase().includes(searchQ.toLowerCase()) || brand.toLowerCase().includes(searchQ.toLowerCase());
    return matchCat && matchQ;
  });

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const advisors = [
    { name: "Zara Ahmed",   role: "Beauty Advisor",  speciality: "Bridal & Everyday Glam",          icon: "💄" },
    { name: "Fatima Malik", role: "Skincare Expert",  speciality: "Colour Matching & Skincare",       icon: "✨" },
    { name: "Ayesha Khan",  role: "Makeup Artist",   speciality: "Virtual & In-Store Consultations", icon: "🌸" },
  ];

  const nav = (p) => { setPage(p); window.scrollTo(0,0); };

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#fffbfb", minHeight: "100vh", color: "#333" }}>

      {/* NAVBAR */}
      <nav style={{ background: "white", borderBottom: "1px solid #f8eaea", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 20px rgba(200,120,120,0.08)" }}>
        <div onClick={() => nav("home")} style={{ cursor: "pointer" }}>
          <span style={{ fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg, #e8a0a0, #c0392b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Glam</span>
          <span style={{ fontSize: 26, fontWeight: 300, color: "#999", fontStyle: "italic" }}>base</span>
          <span style={{ fontSize: 18, marginLeft: 4 }}>💄</span>
        </div>
        <div style={{ display: "flex", gap: 32, fontSize: 14, fontWeight: 500 }}>
          {[["home","Home"],["shop","Shop"],["advisors","Advisors"],["database","Database 🗄️"],["about","About"]].map(([p,l]) => (
            <span key={p} onClick={() => nav(p)} style={{ cursor: "pointer", color: page === p ? "#c0392b" : "#666", borderBottom: page === p ? "2px solid #e8a0a0" : "2px solid transparent", paddingBottom: 4, transition: "all 0.2s" }}>{l}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#999" }}>GLAM20 for 20% off!</span>
          <button onClick={() => setCartOpen(true)} style={{ background: "linear-gradient(135deg, #e8a0a0, #c0392b)", color: "white", border: "none", borderRadius: 12, padding: "8px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            🛍 Bag {cartCount > 0 && <span style={{ background: "rgba(255,255,255,0.3)", borderRadius: 10, padding: "0 7px", fontSize: 12 }}>{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* HOME PAGE */}
      {page === "home" && (
        <>
          <div style={{ background: "linear-gradient(135deg, #fff0f0 0%, #fde8ec 50%, #fff5f8 100%)", padding: "80px 60px", display: "flex", alignItems: "center", gap: 60, position: "relative", overflow: "hidden" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, letterSpacing: 3, color: "#e8a0a0", fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>Pakistan's Favourite Makeup Store</div>
              <h1 style={{ fontSize: 52, fontWeight: 800, color: "#2c1810", lineHeight: 1.15, margin: "0 0 20px" }}>
                Your Beauty,<br />
                <span style={{ background: "linear-gradient(135deg, #e8a0a0, #c0392b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Your Story.</span>
              </h1>
              <p style={{ fontSize: 17, color: "#777", lineHeight: 1.8, maxWidth: 440, marginBottom: 32 }}>
                Discover luxe international brands and beloved local favourites — Huda Beauty, Charlotte Tilbury, Medora &amp; more. Free delivery above PKR 2,000.
              </p>
              <div style={{ display: "flex", gap: 16 }}>
                <button onClick={() => nav("shop")} style={{ background: "linear-gradient(135deg, #e8a0a0, #c0392b)", color: "white", border: "none", borderRadius: 14, padding: "14px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Shop Now 💄</button>
                <button onClick={() => nav("advisors")} style={{ background: "transparent", color: "#c0392b", border: "2px solid #e8a0a0", borderRadius: 14, padding: "14px 28px", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Book Advisor ✨</button>
              </div>
              <div style={{ display: "flex", gap: 32, marginTop: 40 }}>
                {[["8+","Brands"],["50+","Products"],["1000+","Happy Customers"]].map(([n,l]) => (
                  <div key={l}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#c0392b" }}>{n}</div>
                    <div style={{ fontSize: 12, color: "#bbb", letterSpacing: 1 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 30 }}>
                <img src="https://images.unsplash.com/photo-1586495777744-4e6232bf2082?w=280&q=80" style={{ width: 180, height: 220, objectFit: "cover", borderRadius: 20 }} alt="lipstick" />
                <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=280&q=80" style={{ width: 180, height: 160, objectFit: "cover", borderRadius: 20 }} alt="blush" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=280&q=80" style={{ width: 180, height: 180, objectFit: "cover", borderRadius: 20 }} alt="makeup" />
                <img src="https://images.unsplash.com/photo-1631229120960-16da7c0cf4a9?w=280&q=80" style={{ width: 180, height: 200, objectFit: "cover", borderRadius: 20 }} alt="eyeshadow" />
              </div>
            </div>
          </div>

          <div style={{ background: "white", padding: "24px 60px", borderBottom: "1px solid #fdf0f0" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
              {BRANDS.map(b => <span key={b} style={{ fontSize: 13, fontWeight: 600, color: "#bbb", letterSpacing: 1, textTransform: "uppercase" }}>{b}</span>)}
            </div>
          </div>

          <div style={{ padding: "60px 60px 40px", textAlign: "center" }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: "#2c1810", marginBottom: 8 }}>Shop by Category</h2>
            <p style={{ color: "#aaa", fontSize: 15, marginBottom: 36 }}>Find your perfect product ✨</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
              {[
                { name: "Lips", icon: "💋", cat: "Lipstick" },
                { name: "Eyes", icon: "👁", cat: "Eyes" },
                { name: "Face", icon: "✨", cat: "Foundation" },
                { name: "Blush", icon: "🌸", cat: "Blush" },
                { name: "Gloss", icon: "💖", cat: "Lip Gloss" },
              ].map(c => (
                <div key={c.name} onClick={() => { setSelectedCategory(c.cat); nav("shop"); }}
                  style={{ background: "white", borderRadius: 20, padding: "28px 16px", textAlign: "center", cursor: "pointer", boxShadow: "0 4px 20px rgba(200,120,120,0.1)", transition: "all 0.2s", border: "1.5px solid #fdf0f0" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{c.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#555" }}>{c.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: "20px 60px 80px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <div>
                <h2 style={{ fontSize: 32, fontWeight: 700, color: "#2c1810", marginBottom: 4 }}>Bestsellers 💄</h2>
                <p style={{ color: "#aaa", fontSize: 15, margin: 0 }}>Our most loved products</p>
              </div>
              <button onClick={() => nav("shop")} style={{ background: "none", border: "2px solid #e8a0a0", color: "#c0392b", borderRadius: 12, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>View All →</button>
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: "#e8a0a0", fontSize: 16 }}>Loading products... 💄</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
                {products.slice(0,4).map(p => (
                  <ProductCard key={p.product_id} product={p} onAddToCart={addToCart} onView={setViewProduct} />
                ))}
              </div>
            )}
          </div>

          <div style={{ margin: "0 60px 80px", background: "linear-gradient(135deg, #c0392b, #e8a0a0, #c0392b)", borderRadius: 24, padding: "40px 60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Limited Time Offer</div>
              <h3 style={{ fontSize: 34, fontWeight: 800, color: "white", margin: "0 0 8px" }}>Get 20% Off</h3>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 16, margin: 0 }}>Use code <strong>GLAM20</strong> at checkout · Min order PKR 1,000</p>
            </div>
            <button onClick={() => nav("shop")} style={{ background: "white", color: "#c0392b", border: "none", borderRadius: 14, padding: "16px 36px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Shop Now →</button>
          </div>
        </>
      )}

      {/* SHOP PAGE */}
      {page === "shop" && (
        <div style={{ padding: "40px 60px" }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: "#2c1810", marginBottom: 8 }}>All Products 💄</h2>
          <p style={{ color: "#aaa", marginBottom: 32 }}>Discover your perfect glam look</p>
          <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap", alignItems: "center" }}>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder="🔍 Search products or brands..."
              style={{ border: "1.5px solid #f5e8e8", borderRadius: 12, padding: "10px 16px", fontSize: 14, outline: "none", minWidth: 280, background: "white" }}
            />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setSelectedCategory(c)} style={{
                  background: selectedCategory === c ? "linear-gradient(135deg,#e8a0a0,#c0392b)" : "white",
                  color: selectedCategory === c ? "white" : "#888",
                  border: "1.5px solid " + (selectedCategory === c ? "transparent" : "#f5e8e8"),
                  borderRadius: 20, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer"
                }}>{c}</button>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 14, color: "#bbb", marginBottom: 20 }}>{filtered.length} products found</div>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#e8a0a0", fontSize: 16 }}>Loading products... 💄</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
              {filtered.map(p => (
                <ProductCard key={p.product_id} product={p} onAddToCart={addToCart} onView={setViewProduct} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* DATABASE PAGE */}
      {page === "database" && <DatabasePage />}

      {/* ADVISORS PAGE */}
      {page === "advisors" && (
        <div style={{ padding: "60px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 38, fontWeight: 700, color: "#2c1810", marginBottom: 12 }}>Meet Our Beauty Advisors ✨</h2>
            <p style={{ color: "#aaa", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>Book a personal session for bridal makeup, skincare advice, colour matching, and more.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, maxWidth: 900, margin: "0 auto 60px" }}>
            {advisors.map(a => <AdvisorCard key={a.name} advisor={a} />)}
          </div>
          <div style={{ background: "linear-gradient(135deg, #fff0f0, #fde8ec)", borderRadius: 24, padding: "48px 60px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
            <h3 style={{ fontSize: 26, fontWeight: 700, color: "#2c1810", marginBottom: 12 }}>Session Types</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 28 }}>
              {[
                { name: "Bridal Glam",      icon: "👰", duration: "90 min", desc: "Full bridal look consultation" },
                { name: "Everyday Glam",    icon: "💄", duration: "45 min", desc: "Day-to-day makeup tips" },
                { name: "Skincare Advice",  icon: "🌿", duration: "45 min", desc: "Personalised skincare routine" },
                { name: "Colour Matching",  icon: "🎨", duration: "30 min", desc: "Find your perfect foundation" },
                { name: "Virtual Session",  icon: "💻", duration: "45 min", desc: "Online video consultation" },
                { name: "Special Occasion", icon: "🌟", duration: "60 min", desc: "Party & event looks" },
              ].map(s => (
                <div key={s.name} style={{ background: "white", borderRadius: 16, padding: 20, textAlign: "left", boxShadow: "0 2px 16px rgba(200,120,120,0.08)" }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, color: "#333", marginBottom: 4 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "#e8a0a0", marginBottom: 6 }}>{s.duration}</div>
                  <div style={{ fontSize: 13, color: "#888" }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABOUT PAGE */}
      {page === "about" && (
        <div style={{ padding: "60px", maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: 38, fontWeight: 700, color: "#2c1810", marginBottom: 24 }}>About GlamBase 💄</h2>
          <div style={{ background: "white", borderRadius: 24, padding: 40, boxShadow: "0 4px 30px rgba(200,120,120,0.1)", marginBottom: 32 }}>
            <p style={{ fontSize: 16, color: "#555", lineHeight: 1.9, marginBottom: 20 }}>GlamBase is Pakistan's curated online makeup destination, bringing you the best of international luxury and local beauty brands in one gorgeous place.</p>
            <p style={{ fontSize: 16, color: "#555", lineHeight: 1.9, marginBottom: 20 }}>From Huda Beauty's iconic Power Bullet to beloved local gems from Medora and Rivaj UK — we believe every person deserves access to quality makeup that makes them feel confident and beautiful.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 32 }}>
              {[
                { title: "Loyalty Points",  desc: "Earn GlamPoints on every order and redeem them for discounts", icon: "💎" },
                { title: "Beauty Advisors", desc: "Book personal sessions for bridal, everyday or virtual glam",  icon: "✨" },
                { title: "Shade Matching",  desc: "Each product shows all available shades with colour codes",    icon: "🎨" },
                { title: "Secure Payments", desc: "EasyPaisa, JazzCash, Bank Transfer & Cash on Delivery",       icon: "🔒" },
              ].map(f => (
                <div key={f.title} style={{ background: "#fff8f8", borderRadius: 16, padding: 20 }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
                  <div style={{ fontWeight: 700, color: "#333", marginBottom: 6 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #c0392b, #e8a0a0)", borderRadius: 24, padding: "32px 40px", color: "white" }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>DBMS Project Info 💻</h3>
            <p style={{ opacity: 0.9, lineHeight: 1.7, marginBottom: 0 }}>This website is built as a 4th semester Software Engineering DBMS project. The database (GlamBase) includes 18 tables with brands, products, shades, customers, orders, loyalty points, beauty advisor bookings, inventory management, stored procedures, triggers, views, and role-based access control.</p>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ background: "#2c1810", color: "rgba(255,255,255,0.6)", padding: "48px 60px 32px", marginTop: 40 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 12 }}>GlamBase 💄</div>
            <p style={{ fontSize: 14, lineHeight: 1.8 }}>Pakistan's curated makeup destination. Luxury & local, all in one place.</p>
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 600, marginBottom: 14 }}>Shop</div>
            {["Lips","Eyes","Face","Blush","Tools"].map(c => <div key={c} style={{ marginBottom: 8, fontSize: 14 }}>{c}</div>)}
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 600, marginBottom: 14 }}>Brands</div>
            {["Huda Beauty","Charlotte Tilbury","Medora","Rivaj UK"].map(b => <div key={b} style={{ marginBottom: 8, fontSize: 14 }}>{b}</div>)}
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 600, marginBottom: 14 }}>Help</div>
            {["Shipping Policy","Return Policy","Contact Us","Book Advisor"].map(h => <div key={h} style={{ marginBottom: 8, fontSize: 14 }}>{h}</div>)}
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
          <span>© 2025 GlamBase · DBMS Project · 4th Semester Software Engineering</span>
          <span>Made with 💕 in Pakistan</span>
        </div>
      </footer>

      {/* CART DRAWER */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
          checkingOut={checkingOut}
        />
      )}

      {viewProduct && <ProductModal product={viewProduct} onClose={() => setViewProduct(null)} onAddToCart={addToCart} />}
      {toast && <Toast msg={toast} />}

      {/* ORDER SUCCESS POPUP — now shows real order ID from database */}
      {orderDone && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
          <div style={{ background: "white", borderRadius: 24, padding: 48, textAlign: "center", maxWidth: 420 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: "#333", marginBottom: 12 }}>Order Placed!</h3>
            {lastOrderId && (
              <div style={{ background: "#fdf0f0", borderRadius: 12, padding: "10px 20px", marginBottom: 16, display: "inline-block" }}>
                <span style={{ fontSize: 13, color: "#888" }}>Order ID: </span>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#c0392b" }}>#{lastOrderId}</span>
                <span style={{ fontSize: 11, color: "#aaa", display: "block", marginTop: 2 }}>✅ Saved to MySQL database</span>
              </div>
            )}
            <p style={{ color: "#888", lineHeight: 1.7 }}>Your glam is on its way! You'll receive a confirmation shortly.</p>
            <div style={{ marginTop: 8, fontSize: 13, color: "#e8a0a0" }}>GlamPoints have been added to your account 💎</div>
            <button
              onClick={() => setOrderDone(false)}
              style={{ marginTop: 20, background: "linear-gradient(135deg, #e8a0a0, #c0392b)", color: "white", border: "none", borderRadius: 12, padding: "10px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Continue Shopping 💄
            </button>
          </div>
        </div>
      )}
    </div>
  );
}