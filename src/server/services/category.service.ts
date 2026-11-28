import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

export async function getAllCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
  return categories;
}

export async function createCategory(name: string, description?: string, icon?: string) {
  const trimmed = name.trim();
  const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const cat = await prisma.category.upsert({
    where: { name: trimmed },
    update: { description, icon },
    create: {
      name: trimmed,
      slug,
      description: description || `Specialists and services in ${trimmed}`,
      icon,
    },
  });

  logger.info({ category: cat.name }, 'Category created/upserted');
  return cat;
}

export async function updateCategory(
  idOrName: string,
  data: { name?: string; description?: string; icon?: string }
) {
  try {
    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ id: idOrName }, { name: { equals: idOrName, mode: 'insensitive' } }],
      },
    });

    if (!existing) return null;

    const updateData: { name?: string; slug?: string; description?: string; icon?: string | null } = {};
    if (data.description !== undefined) {
      updateData.description = data.description.trim();
    }
    if (data.icon !== undefined) {
      updateData.icon = data.icon.trim() || null;
    }

    const oldName = existing.name;
    if (data.name && data.name.trim() && data.name.trim() !== existing.name) {
      const newName = data.name.trim();
      const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      updateData.name = newName;
      updateData.slug = slug;

      // Update worker profiles assigned to old category trade name
      await prisma.workerProfile.updateMany({
        where: { trade: { equals: oldName, mode: 'insensitive' } },
        data: { trade: newName },
      });
    }

    const updated = await prisma.category.update({
      where: { id: existing.id },
      data: updateData,
    });

    logger.info({ categoryId: updated.id, oldName, newName: updated.name }, 'Category updated');
    return updated;
  } catch (error) {
    logger.error({ error, target: idOrName }, 'Failed to update category');
    return null;
  }
}

export async function deleteCategory(nameOrId: string) {
  try {
    const deleted = await prisma.category.deleteMany({
      where: {
        OR: [{ id: nameOrId }, { name: { equals: nameOrId, mode: 'insensitive' } }],
      },
    });
    logger.info({ target: nameOrId }, 'Category deleted');
    return deleted.count > 0;
  } catch (error) {
    logger.error({ error, target: nameOrId }, 'Failed to delete category');
    return false;
  }
}

