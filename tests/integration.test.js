const request = require("supertest");
const app = require("../index"); // เรียกใช้ index
const pool = require("../config/db");

let userToken = "";
// สุ่ม username เพื่อไม่ให้ซ้ำเวลา test หลายรอบ
const testUser = {
  firstname: "Jirapat",
  fullname: "Jirapat Test",
  lastname: "Dev",
  username: `user_${Date.now()}`,
  password: "password123",
  address: "Chiang Mai",
  phone: "0812345678",
  email: "test@example.com",
};

describe("Integration Test for Food Delivery API", () => {
  // 1. ทดสอบสมัครสมาชิก (Register)
  test("POST /api/auth/register - ควรสมัครสมาชิกได้สำเร็จ", async () => {
    // เพิ่ม /api นำหน้า URL
    const res = await request(app).post("/api/auth/register").send(testUser);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "สมัครสมาชิกสำเร็จ");
  });

  // 2. ทดสอบล็อกอิน (Login)
  test("POST /api/auth/login - ควรล็อกอินได้และได้ Token กลับมา", async () => {
    // เพิ่ม /api นำหน้า URL
    const res = await request(app).post("/api/auth/login").send({
      username: testUser.username,
      password: testUser.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");

    userToken = res.body.token; // เก็บ Token ไว้ใช้ต่อ
  });

  // 3. ทดสอบดึงข้อมูลเมนู
  test("GET /api/menus - ควรดึงข้อมูลเมนูได้", async () => {
    // เพิ่ม /api นำหน้า URL
    const res = await request(app).get("/api/menus");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("menus");
    expect(Array.isArray(res.body.menus)).toBe(true);
  });

  // 4. ทดสอบดึงข้อมูลลูกค้า (ต้องมี Token)
  test("GET /api/customers - ควรดึงข้อมูลลูกค้าได้เมื่อมี Token", async () => {
    // เพิ่ม /api นำหน้า URL
    const res = await request(app)
      .get("/api/customers")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("customers");
  });

  // 5. ทดสอบกรณีไม่มี Token
  test("GET /api/customers - ไม่ควรดึงข้อมูลได้ถ้าไม่มี Token", async () => {
    // เพิ่ม /api นำหน้า URL
    const res = await request(app).get("/api/customers");

    expect([401, 403]).toContain(res.statusCode);
  });

  // ปิด DB หลังจบการทำงาน
  afterAll(async () => {
    await pool.end();
  });
});
