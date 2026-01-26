import {
  registerUser,
  loginUser,
  getUserById,
  generateToken,
} from "#services/auth.service.js";
import {
  loginSchema,
  registerSchema,
} from "#src/validations/auth.validation.js";
import logger from "#utils/logger.js";

/**
 * Register a new user
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    const user = await registerUser({ email, password, name });
    const token = generateToken(user.id);

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    logger.error("Registration error:", error);

    if (error.message === "User with this email already exists") {
      return res.status(409).json({
        error: error.message,
      });
    } else {
      return res.status(400).json({
        error: error.message,
      });
    }
  }
};

/**
 * Login a user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const { user, token } = await loginUser(email, password);

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    logger.error("Login error:", error);
    if (error.message === "Invalid email or password") {
      return res.status(401).json({
        error: error.message,
      });
    } else {
      return res.status(400).json({
        error: error.message,
      });
    }
  }
};

/**
 * Logout a user (clear token cookie)
 */
export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    message: "Logout successful",
  });
};

/**
 * Get current authenticated user
 */
export const getMe = async (req, res) => {
  res.status(200).json({
    user: req.user,
  });
};
