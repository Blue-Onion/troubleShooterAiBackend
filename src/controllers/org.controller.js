import { createOrg, getOrg, getOrgs, joinOrg } from "#src/services/org.service.js";

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
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { name, description, address, slug, jobCategories, issueCategories } = req.body;
    if (!name) return res.status(400).json({ error: "Organization name is required" });
    try {
        const org = await createOrg(userId, { name, description, address, slug, jobCategories, issueCategories });
        res.status(201).json(org);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const joiningOrg = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
  
    const { id } = req.params;
    const { role, job } = req.body;
  
    if (!id) return res.status(400).json({ error: "Invalid id" });
    if (!role) return res.status(400).json({ error: "Role is required" });
  
    try {
      const membership = await joinOrg(userId, id, { role, job });
      return res.status(201).json(membership);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

    