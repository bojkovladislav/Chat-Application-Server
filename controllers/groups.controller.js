import ApiError from '../exceptions/api.error.js';
import { checkDefaultParams } from '../helpers/businessHelpers.js';
import { groupsService } from '../services/groups.service.js';

const getFilteredGroups = async (req, res) => {
  const { arrayOfIds, name } = req.body;

  checkDefaultParams({ arrayOfIds, name });

  const groups = await groupsService.getGroups(arrayOfIds);

  if (!groups) ApiError.notFound();

  const filteredGroups = !name.length
    ? null
    : groups.filter(
        (group) =>
          group.name.toLowerCase().includes(name.toLowerCase()) ||
          group.isPublic
      );

  res.send({
    message: "You've successfully got filtered groups",
    filteredGroups,
  });
};

export const groupsController = {
  getFilteredGroups,
};
