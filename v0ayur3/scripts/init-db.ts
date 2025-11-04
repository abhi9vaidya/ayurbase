import initializeDatabase from "@/lib/db"

async function main() {
  console.log("[v0] Initializing database...")
  try {
    await initializeDatabase()
    console.log("[v0] Database initialized successfully")
  } catch (error) {
    console.error("[v0] Database initialization failed:", error)
    process.exit(1)
  }
}

main()
