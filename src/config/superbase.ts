import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config()

let SUPERBASE_URL = process.env.SUPERBASE_URL || ""
if (SUPERBASE_URL.includes("/rest/v1")) {
  SUPERBASE_URL = SUPERBASE_URL.replace(/\/rest\/v1\/?$/, "")
}

const SUPERBASE_KEY = process.env.SUPERBASE_KEY || ""

export const supabase = createClient(SUPERBASE_URL, SUPERBASE_KEY)