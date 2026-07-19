import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "superadmin@jeet.com";
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log("Super admin already exists.");
    return;
  }

  const hashedPassword = await bcrypt.hash("SuperAdmin@123", 10);

  await prisma.user.create({
    data: {
      name: "Super Admin",
      email,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isVerified: true,
      selfRegistered: false,
    },
  });

  console.log("✅ Super admin created:", email);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());