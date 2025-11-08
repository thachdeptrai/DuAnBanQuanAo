import jwt from "jsonwebtoken";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "supersecretaccess";

// Middleware xác thực chuẩn
function authMiddleware(req, res, next) {
  console.log(
    `[AUTH-MIDDLEWARE DEBUG] Request URL: ${req.method} ${req.originalUrl}`
  );

  let token;

  // 1. Lấy token từ header "Authorization"
  const authHeader = req.headers["authorization"];
  console.log(
    `[AUTH-MIDDLEWARE DEBUG] Authorization Header Received:`,
    authHeader
  );

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // 2. Nếu không có header thì thử lấy từ cookie
  if (!token && req.cookies?.token) {
    console.log("[AUTH-MIDDLEWARE DEBUG] Token lấy từ cookie");
    token = req.cookies.token;
  }

  // 3. Nếu vẫn không có token thì báo lỗi
  if (!token) {
    console.error("[AUTH-MIDDLEWARE ERROR] Token missing in header or cookie");
    return res.status(401).json({
      message: "Thiếu token xác thực (Authorization header hoặc cookie).",
    });
  }

  // 4. Xác minh token
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    req.user = decoded;

    console.log(
      `[AUTH-MIDDLEWARE DEBUG] ✅ Token Verified | User ID: ${decoded.id}`
    );

    next();
  } catch (err) {
    console.error(
      "[AUTH-MIDDLEWARE ERROR] JWT Verification Error:",
      err.message
    );

    let errorMessage = "Token không hợp lệ.";

    if (err.name === "TokenExpiredError") {
      errorMessage = "Token đã hết hạn.";
    } else if (err.name === "JsonWebTokenError") {
      errorMessage = "Token bị lỗi hoặc chữ ký không hợp lệ.";
    }

    return res.status(401).json({ message: errorMessage });
  }
}

export { authMiddleware };
