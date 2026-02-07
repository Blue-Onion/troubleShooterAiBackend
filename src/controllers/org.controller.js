import {
  createOrg,
  deleteOrg,
  getOrg,
  getOrgs,
  joinOrg,
  leaveOrg,
} from "#src/services/org.service.js";
import logger from "#src/utils/logger.js";
import {
  createOrgSchema,
  joinOrgSchema,
  orgIdParamSchema,
} from "#src/validations/org.validation.js";

export const gettingAllOrg = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const orgs = await getOrgs(userId);
    res.status(200).json(orgs);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};
export const gettingOrg = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const { id } = orgIdParamSchema.parse(req.params);
  if (!id) return res.status(401).json({ error: "Invalid id" });
  try {
    const org = await getOrg(userId, id);
    res.status(200).json(org);
  } catch (error) {
    if (error.name === "ZodError") {
      const JsonErr = JSON.parse(error.message);
      return res.status(400).json({
        error: JsonErr.map((err) => {
          return err.message;
        }),
      });
    }
    res.status(error.status || 500).json({ error: error.message });
  }
};
export const creatingOrg = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const data = createOrgSchema.parse(req.body);
    const org = await createOrg(userId, data);
    return res.status(201).json(org);
  } catch (error) {
    if (error.name === "ZodError") {
      const JsonErr = JSON.parse(error.message);
      return res.status(400).json({
        error: JsonErr.map((err) => {
          return err.message;
        }),
      });
    }
    res.status(error.status || 500).json({ error: error.message });
  }
};
export const joiningOrg = async (req, res) => {
  const userId = req.user?.id;
  const { id } = orgIdParamSchema.parse(req.params);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!id) return res.status(400).json({ error: "Invalid id" });

  try {
    const data = joinOrgSchema.parse(req.body);

    const membership = await joinOrg(userId, id, data);
    return res.status(201).json(membership);
  } catch (error) {
    if (error.name === "ZodError") {
      const JsonErr = JSON.parse(error.message);
      return res.status(400).json({
        error: JsonErr.map((err) => {
          return err.message;
        }),
      });
    }
    res.status(error.status || 500).json({ error: error.message });
  }
};
export const deletingOrg = async (req, res) => {
  const userId = req.user?.id;
  const { id } = orgIdParamSchema.parse(req.params);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!id) return res.status(401).json({ error: "Invalid id" });
  try {
    const org = await deleteOrg(userId, id);
    return res.status(200).json(org);
  } catch (error) {
    if (error.name === "ZodError") {
      const JsonErr = JSON.parse(error.message);
      return res.status(400).json({
        error: JsonErr.map((err) => {
          return err.message;
        }),
      });
    }
    res.status(error.status || 500).json({ error: error.message });
  }
};
export const leavingOrg = async (req, res) => {
  const userId = req.user?.id;
  const { id } = orgIdParamSchema.parse(req.params);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!id) return res.status(401).json({ error: "Invalid id" });
  try {
    const org = await leaveOrg(userId, id);
    return res.status(200).json(org);
  } catch (error) {
    if (error.name === "ZodError") {
      const JsonErr = JSON.parse(error.message);
      return res.status(400).json({
        error: JsonErr.map((err) => {
          return err.message;
        }),
      });
    }
    res.status(error.status || 500).json({ error: error.message });
  }
};
