import { createOrg, getOrg, getOrgs, joinOrg } from "#src/services/org.service.js";
import logger from "#src/utils/logger.js";
import { createOrgSchema, orgIdParamSchema } from "#src/validations/org.validation.js";
import { log } from "console";

export const gettingAllOrg = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const orgs = await getOrgs(userId);
    res.status(200).json(orgs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const gettingOrg = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Invalid id" });
  try {
    const org = await getOrg(userId, id);
    res.status(200).json(org);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const creatingOrg = async (req, res) => {
    const userId = req.user?.id;
    console.log(userId);

  
    try {
      const data = createOrgSchema.parse(req.body);
      const org = await createOrg(userId, data);
      return res.status(201).json(org);
    } catch (error) {
        logger.error(error.message);
      return res.status(400).json({ error: error.message });
    }
  };
  export const joiningOrg = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
  
    try {
      const { id } = orgIdParamSchema.parse(req.params);
      const data = joinOrgSchema.parse(req.body);
  
      const membership = await joinOrg(userId, id, data);
      return res.status(201).json(membership);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

    