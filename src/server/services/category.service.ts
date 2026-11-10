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

