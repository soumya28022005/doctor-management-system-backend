import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "superadmin@jeet.com";
  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
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
  } else {
    console.log("Super admin already exists.");
  }

  const settingsExist = await prisma.platformSetting.findFirst();
  if (!settingsExist) {
    await prisma.platformSetting.create({ data: {} }); // uses schema default (180)
    console.log("✅ Platform settings row created (bookingWindowMinutes: 180)");
  } else {
    console.log("Platform settings already exist.");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());