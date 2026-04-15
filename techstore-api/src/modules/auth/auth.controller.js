import * as authService from './auth.service.js'
import { setAuthCookie } from './auth.service.js'
import {
  registerSchema, verifyCodeSchema, loginSchema, googleAuthSchema,
  updateProfileSchema, changePasswordSchema, setPasswordSchema, addressSchema,
} from './auth.validators.js'

export async function register(req, res, next) {
  try {
    const data   = registerSchema.parse(req.body)
    const result = await authService.sendVerificationCode(data)
    res.status(200).json(result)
  } catch (err) { next(err) }
}

export async function verifyEmail(req, res, next) {
  try {
    const data            = verifyCodeSchema.parse(req.body)
    const { user, token } = await authService.verifyCodeAndRegister(data)
    setAuthCookie(res, token)
    res.status(201).json({ user, token })
  } catch (err) { next(err) }
}

export async function login(req, res, next) {
  try {
    const data            = loginSchema.parse(req.body)
    const { user, token } = await authService.login(data)
    setAuthCookie(res, token)
    res.json({ user, token })
  } catch (err) { next(err) }
}

export async function googleAuth(req, res, next) {
  try {
    const { credential }  = googleAuthSchema.parse(req.body)
    const { user, token } = await authService.loginWithGoogle(credential)
    setAuthCookie(res, token)
    res.json({ user, token })
  } catch (err) { next(err) }
}

export async function getMe(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id)
    res.json(user)
  } catch (err) { next(err) }
}

export async function updateMe(req, res, next) {
  try {
    const data = updateProfileSchema.parse(req.body)
    const user = await authService.updateProfile(req.user.id, data)
    res.json(user)
  } catch (err) { next(err) }
}

export async function changePassword(req, res, next) {
  try {
    const data   = changePasswordSchema.parse(req.body)
    const result = await authService.changePassword(req.user.id, data)
    res.json(result)
  } catch (err) { next(err) }
}

export async function setPassword(req, res, next) {
  try {
    const data   = setPasswordSchema.parse(req.body)
    const result = await authService.setPassword(req.user.id, data)
    res.json(result)
  } catch (err) { next(err) }
}

export async function addAddress(req, res, next) {
  try {
    const data    = addressSchema.parse(req.body)
    const address = await authService.addAddress(req.user.id, data)
    res.status(201).json(address)
  } catch (err) { next(err) }
}

export async function updateAddress(req, res, next) {
  try {
    const data    = addressSchema.partial().parse(req.body)
    const address = await authService.updateAddress(req.user.id, req.params.id, data)
    res.json(address)
  } catch (err) { next(err) }
}

export async function deleteAddress(req, res, next) {
  try {
    const result = await authService.deleteAddress(req.user.id, req.params.id)
    res.json(result)
  } catch (err) { next(err) }
}
