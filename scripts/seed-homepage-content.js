#!/usr/bin/env node
/**
 * Seed homepage CMS content types with existing hardcoded data.
 * Run: node scripts/seed-homepage-content.js
 *
 * Idempotent — skips creation if entries already exist.
 */

const STRAPI_URL = process.env.STRAPI_URL || "https://strapi-production-f609.up.railway.app"
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "varaaayatech@gmail.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "JKAdobe@123"

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

// ─── Source data (mirrors hardcoded frontend config) ───────────────────────

const ANNOUNCEMENT_MESSAGES = [
  { text: "Indulge in Gifting Rewards 💎 | Earn Points on Every Order",          emoji: "", order: 1 },
  { text: "Bespoke Gifting for Every Occasion 🎁 | Weddings, Events & Teams",    emoji: "", order: 2 },
  { text: "Enjoy Free Delivery ✨ | Delhi NCR on Orders ₹499+",                  emoji: "", order: 3 },
  { text: "Crafted for Your Brand 🎨 | Personalized Giveaways for Corporates",   emoji: "", order: 4 },
]

const OCCASION_CARDS = [
  { title: "Birthday Gifts",    blurb: "Mug + candle combos",       emoji: "🎂", href: "/categories/gift-hampers-and-sets", order: 1 },
  { title: "Anniversary Gifts", blurb: "Glassware + candle sets",   emoji: "❤️", href: "/categories/candles",              order: 2 },
  { title: "Kids Gifts",        blurb: "Small curated combos",      emoji: "🧒", href: "/kids-hampers",                    order: 3 },
  { title: "Festive Gifts",     blurb: "Candle + decor sets",       emoji: "🪔", href: "/categories/gift-hampers-and-sets", order: 4 },
  { title: "Corporate Gifting", blurb: "Mug + tray combos",         emoji: "🏢", href: "/corporate-gifting",               order: 5 },
]

const TRUST_ITEMS = [
  { title: "Same-day Delivery",      subtitle: "in Gurugram",           iconName: "delivery", order: 1 },
  { title: "Premium Quality",        subtitle: "Products",              iconName: "quality",  order: 2 },
  { title: "Thoughtful Packaging",   subtitle: "with Love",             iconName: "packaging",order: 3 },
  { title: "Safe & Secure",          subtitle: "Payments",              iconName: "payment",  order: 4 },
  { title: "Easy Returns",           subtitle: "& Support",             iconName: "returns",  order: 5 },
]

const HOMEPAGE_CONFIG = {
  heroHeadline:             "Summer Hosting, Done Beautifully ☀️",
  heroSubtext:              "Discover elegant bottles, mugs & serveware from Varaaya — perfect for daily use & thoughtful gifting.",
  heroCtaLabel:             "Shop Summer Collection",
  heroCtaHref:              "/store?sortBy=created_at",
  occasionSectionTitle:     "Shop by Occasion",
  occasionSectionSubtitle:  "Find the Perfect Gift in Seconds",
  bestsellersTitle:         "Most Loved Products",
  featuredTitle:            "Host in Style This Summer",
  corporateTitle:           "Corporate & Bulk Gifting",
  corporateSubtitle:        "Premium mugs, trays, and candle combos for teams, clients & celebrations.",
  corporateCtaLabel:        "Request Bulk Quote",
  corporateCtaHref:         "/bulk-gifting?quote=1",
}

// ─── Helpers ───────────────────────────────────────────────────────────────

async function login() {
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  if (!res.ok) throw new Error(`Login failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  console.log("✅ Logged in")
  return data.data.token
}

async function countEntries(token, endpoint) {
  const res = await fetch(`${STRAPI_URL}/api/${endpoint}?pagination[pageSize]=1`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return 0
  const data = await res.json()
  return data.meta?.pagination?.total ?? (Array.isArray(data.data) ? data.data.length : 0)
}

async function createEntry(token, endpoint, body) {
  const res = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: body }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`POST ${endpoint} failed: ${res.status} — ${err}`)
  }
  return res.json()
}

async function putSingle(token, endpoint, body) {
  const res = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: body }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`PUT ${endpoint} failed: ${res.status} — ${err}`)
  }
  return res.json()
}

async function enablePublicPermissions(adminToken, uid, actions) {
  // Fetch roles
  const rolesRes = await fetch(`${STRAPI_URL}/api/users-permissions/roles`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  })
  if (!rolesRes.ok) return
  const roles = await rolesRes.json()
  const publicRole = (roles.roles || []).find((r) => r.type === "public")
  if (!publicRole) return

  const roleRes = await fetch(`${STRAPI_URL}/api/users-permissions/roles/${publicRole.id}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  })
  if (!roleRes.ok) return
  const roleData = await roleRes.json()

  const permissions = roleData.role?.permissions || {}
  if (!permissions[uid]) permissions[uid] = { controllers: {} }
  const ctrl = uid.split(".").pop()
  if (!permissions[uid].controllers[ctrl]) permissions[uid].controllers[ctrl] = {}
  for (const action of actions) {
    permissions[uid].controllers[ctrl][action] = { enabled: true }
  }

  await fetch(`${STRAPI_URL}/api/users-permissions/roles/${publicRole.id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ permissions }),
  })
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🌱 Seeding homepage content to ${STRAPI_URL}\n`)

  const token = await login()

  // ── 1. Announcement Messages ──
  console.log("\n📢 Announcement Messages")
  const existingMsgs = await countEntries(token, "announcement-messages")
  if (existingMsgs > 0) {
    console.log(`   ⏭  Already has ${existingMsgs} entries — skipping`)
  } else {
    for (const msg of ANNOUNCEMENT_MESSAGES) {
      await createEntry(token, "announcement-messages", { ...msg, active: true })
      process.stdout.write("   ✓ " + msg.text.slice(0, 60) + "\n")
    }
  }

  // ── 2. Occasion Cards ──
  console.log("\n🎁 Occasion Cards")
  const existingCards = await countEntries(token, "occasion-cards")
  if (existingCards > 0) {
    console.log(`   ⏭  Already has ${existingCards} entries — skipping`)
  } else {
    for (const card of OCCASION_CARDS) {
      await createEntry(token, "occasion-cards", { ...card, active: true })
      process.stdout.write("   ✓ " + card.title + "\n")
    }
  }

  // ── 3. Trust Items ──
  console.log("\n🛡  Trust Strip Items")
  const existingTrust = await countEntries(token, "trust-items")
  if (existingTrust > 0) {
    console.log(`   ⏭  Already has ${existingTrust} entries — skipping`)
  } else {
    for (const item of TRUST_ITEMS) {
      await createEntry(token, "trust-items", { ...item, active: true })
      process.stdout.write("   ✓ " + item.title + "\n")
    }
  }

  // ── 4. Homepage Config (single type — always upsert) ──
  console.log("\n⚙️  Homepage Config")
  try {
    await putSingle(token, "homepage-config", HOMEPAGE_CONFIG)
    console.log("   ✓ Config saved")
  } catch (e) {
    // Single type may not exist yet — try POST (Strapi auto-upgrades)
    try {
      await createEntry(token, "homepage-config", HOMEPAGE_CONFIG)
      console.log("   ✓ Config created")
    } catch (e2) {
      console.warn("   ⚠ Could not save homepage config:", e2.message)
    }
  }

  // ── 5. Enable public read permissions ──
  console.log("\n🔓 Setting public read permissions…")
  const contentTypes = [
    ["plugin::users-permissions.permission", ["find", "findone"]],
    ["api::announcement-message.announcement-message", ["find", "findone"]],
    ["api::occasion-card.occasion-card", ["find", "findone"]],
    ["api::trust-item.trust-item", ["find", "findone"]],
    ["api::homepage-config.homepage-config", ["find"]],
  ]
  for (const [uid, actions] of contentTypes) {
    try {
      await enablePublicPermissions(token, uid, actions)
      console.log("   ✓ " + uid)
    } catch {
      console.log("   ⚠ Could not set permissions for " + uid)
    }
  }

  console.log("\n✅ Seed complete!\n")
  console.log("Next steps:")
  console.log("  1. Deploy / restart Strapi so new schemas are applied")
  console.log("  2. Run this script again to populate the data")
  console.log("  3. Visit Strapi admin to upload images for Occasion Cards\n")
}

main().catch((err) => {
  console.error("\n❌ Seed failed:", err.message)
  process.exit(1)
})
