import * as authService from '../services/auth.service.js'
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  updateProfileSchema,
  changePasswordSchema,
  addressSchema,
} from '../validators/auth.validators.js'

// ─── POST /api/auth/register ─────────────────────────────────────────────────
export async function register(req, res, next) {
  try {
    const data   = registerSchema.parse(req.body)
    const result = await authService.register(data)
    res.status(201).json(result)
  } catch (err) { next(err) }
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export async function login(req, res, next) {
  try {
    const data   = loginSchema.parse(req.body)
    const result = await authService.login(data)
    res.json(result)
  } catch (err) { next(err) }
}

// ─── POST /api/auth/google ────────────────────────────────────────────────────
export async function googleAuth(req, res, next) {
  try {
    const { credential } = googleAuthSchema.parse(req.body)
    const result = await authService.loginWithGoogle(credential)
    res.json(result)
  } catch (err) { next(err) }
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
export async function getMe(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id)
    res.json(user)
  } catch (err) { next(err) }
}

// ─── PUT /api/auth/me ─────────────────────────────────────────────────────────
export async function updateMe(req, res, next) {
  try {
    const data = updateProfileSchema.parse(req.body)
    const user = await authService.updateProfile(req.user.id, data)
    res.json(user)
  } catch (err) { next(err) }
}

// ─── PUT /api/auth/me/password ────────────────────────────────────────────────
export async function changePassword(req, res, next) {
  try {
    const data   = changePasswordSchema.parse(req.body)
    const result = await authService.changePassword(req.user.id, data)
    res.json(result)
  } catch (err) { next(err) }
}

// ─── POST /api/auth/me/addresses ─────────────────────────────────────────────
export async function addAddress(req, res, next) {
  try {
    const data    = addressSchema.parse(req.body)
    const address = await authService.addAddress(req.user.id, data)
    res.status(201).json(address)
  } catch (err) { next(err) }
}

// ─── PUT /api/auth/me/addresses/:id ──────────────────────────────────────────
export async function updateAddress(req, res, next) {
  try {
    const data    = addressSchema.partial().parse(req.body)
    const address = await authService.updateAddress(req.user.id, req.params.id, data)
    res.json(address)
  } catch (err) { next(err) }
}

// ─── DELETE /api/auth/me/addresses/:id ───────────────────────────────────────
export async function deleteAddress(req, res, next) {
  try {
    const result = await authService.deleteAddress(req.user.id, req.params.id)
    res.json(result)
  } catch (err) { next(err) }
}
