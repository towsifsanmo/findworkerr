import 'dotenv/config';
import prisma from '../src/lib/prisma';
import { auth } from '../src/lib/auth-server';
import initialWorkersData from '../src/lib/initial-workers.json';
import initialCategoriesData from '../src/lib/initial-categories.json';
import initialArticlesData from '../src/lib/initial-articles.json';
import { Worker, BlogArticle } from '../src/types';

async function seed() {
  console.log('--- Starting Database Seeding ---');

  // 1. Seed Categories
  console.log('Seeding categories...');
  const rawCategories = initialCategoriesData as any[];
  for (const cat of rawCategories) {
    const catName = typeof cat === 'string' ? cat : cat.name;
    const slug = typeof cat === 'object' && cat.slug ? cat.slug : catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const description = typeof cat === 'object' && cat.description ? cat.description : `Specialists and services in ${catName}`;
    const icon = typeof cat === 'object' && cat.icon ? cat.icon : null;

    await prisma.category.upsert({
      where: { name: catName },
      update: {
        slug,
        description,
        icon,
      },
      create: {
        name: catName,
        slug,
        description,
        icon,
      },
    });
  }
  console.log(`✓ Seeded ${rawCategories.length} categories.`);

  // 2. Seed Workers with relations
  console.log('Seeding workers and portfolios...');
  const workers = initialWorkersData as Worker[];
  for (const w of workers) {
    await prisma.workerProfile.upsert({
      where: { id: w.id },
      update: {
        name: w.name,
        trade: w.trade,
        craftTitle: w.craftTitle,
        image: w.image,
        badge: w.badge || 'PRO',
        badgeLabel: w.badgeLabel || 'Independent Professional',
        rating: w.rating || 5.0,
        reviewsCount: w.reviewsCount || 0,
        hourlyRate: w.hourlyRate || 80,
        location: w.location || 'Remote Available',
        experienceYears: w.experienceYears || 5,
        availability: w.availability || 'Available Today',
        instantBooking: w.instantBooking ?? true,
        workPreference: w.workPreference || 'Remote First',
        responseTime: w.responseTime || 'Within 24 hours',
        language: w.language || 'English',
        email: w.email || `${w.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@findworker.io`,
        phone: w.phone || '+1 (555) 019-2831',
        website: w.website || `${w.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        bio: w.bio,
        about: w.about || w.bio,
        skills: w.skills || [],
        certifications: w.certifications || ['Verified Independent Specialist'],
        guarantee: w.guarantee || 'Direct contact, 0% platform intermediary commission.',
        status: w.status || 'published',
        featured: w.featured ?? false,
      },
      create: {
        id: w.id,
        name: w.name,
        trade: w.trade,
        craftTitle: w.craftTitle,
        image: w.image,
        badge: w.badge || 'PRO',
        badgeLabel: w.badgeLabel || 'Independent Professional',
        rating: w.rating || 5.0,
        reviewsCount: w.reviewsCount || 0,
        hourlyRate: w.hourlyRate || 80,
        location: w.location || 'Remote Available',
        experienceYears: w.experienceYears || 5,
        availability: w.availability || 'Available Today',
        instantBooking: w.instantBooking ?? true,
        workPreference: w.workPreference || 'Remote First',
        responseTime: w.responseTime || 'Within 24 hours',
        language: w.language || 'English',
        email: w.email || `${w.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@findworker.io`,
        phone: w.phone || '+1 (555) 019-2831',
        website: w.website || `${w.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        bio: w.bio,
        about: w.about || w.bio,
        skills: w.skills || [],
        certifications: w.certifications || ['Verified Independent Specialist'],
        guarantee: w.guarantee || 'Direct contact, 0% platform intermediary commission.',
        status: w.status || 'published',
        featured: w.featured ?? false,
      },
    });

    // Seed Platforms
    if (w.platforms && w.platforms.length > 0) {
      await prisma.platformLink.deleteMany({ where: { workerId: w.id } });
      for (const p of w.platforms) {
        await prisma.platformLink.create({
          data: {
            workerId: w.id,
            name: p.name,
            url: p.url,
            icon: p.icon || 'custom',
            badge: p.badge || 'Verified Pro',
            actionText: p.actionText || `Connect on ${p.name}`,
            active: p.active ?? true,
            clicks: Math.floor(Math.random() * 50) + 10,
          },
        });
      }
    }

    // Seed Portfolio
    if (w.portfolio && w.portfolio.length > 0) {
      await prisma.portfolioItem.deleteMany({ where: { workerId: w.id } });
      for (const port of w.portfolio) {
        await prisma.portfolioItem.create({
          data: {
            workerId: w.id,
            title: port.title,
            category: port.category,
            year: port.year,
            image: port.image,
            description: port.description,
            tags: port.tags || [],
          },
        });
      }
    }

    // Seed Experience
    if (w.experience && w.experience.length > 0) {
      await prisma.experienceItem.deleteMany({ where: { workerId: w.id } });
      for (const exp of w.experience) {
        await prisma.experienceItem.create({
          data: {
            workerId: w.id,
            role: exp.role,
            company: exp.company,
            period: exp.period,
            description: exp.description,
          },
        });
      }
    }

    // Seed Reviews
    if (w.reviews && w.reviews.length > 0) {
      await prisma.review.deleteMany({ where: { workerId: w.id } });
      for (const r of w.reviews) {
        await prisma.review.create({
          data: {
            workerId: w.id,
            author: r.author || 'Verified Client',
            rating: r.rating || 5,
            title: r.title || 'Exceptional Collaboration',
            comment: r.comment || '',
            deviceId: r.deviceId || `device-seed-${w.id}`,
            flagged: r.flagged ?? false,
            approved: r.approved ?? true,
          },
        });
      }
    }
  }
  console.log(`✓ Seeded ${workers.length} worker profiles and associated relations.`);

  // 3. Seed Articles
  console.log('Seeding articles...');
  const articles = initialArticlesData as BlogArticle[];
  for (const a of articles) {
    const slug = a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let authorWorkerId = a.author?.id || null;
    if (authorWorkerId) {
      const exists = await prisma.workerProfile.findUnique({ where: { id: authorWorkerId } });
      if (!exists && a.author) {
        // Create the missing author profile so profile links work seamlessly
        await prisma.workerProfile.create({
          data: {
            id: a.author.id,
            name: a.author.name,
            trade: a.author.role.split('&')[0].trim(),
            craftTitle: a.author.role,
            image: a.author.avatar,
            hourlyRate: a.author.rateNum || 90,
            location: a.author.location || 'Central District',
            bio: a.author.bio,
            about: a.author.bio,
            skills: ['Hydronics', 'Radiant Heating', 'Architectural Fixtures', 'Pipefitting'],
            certifications: ['Master Hydronics Specialist'],
            rating: parseFloat(a.author.rating) || 5.0,
            reviewsCount: a.author.reviewsCount || 0,
          },
        });
      }
    }

    await prisma.article.upsert({
      where: { id: a.id },
      update: {
        slug,
        title: a.title,
        standfirst: a.standfirst,
        category: a.category,
        date: a.date,
        readTime: a.readTime,
        readMinutes: a.readMinutes || 5,
        claps: a.claps || 140,
        heroImage: a.heroImage,
        caption: a.caption,
        toc: (a.toc || []) as any,
        proseHtml: a.proseHtml,
        tags: a.tags || [],
        authorId: authorWorkerId,
      },
      create: {
        id: a.id,
        slug,
        title: a.title,
        standfirst: a.standfirst,
        category: a.category,
        date: a.date,
        readTime: a.readTime,
        readMinutes: a.readMinutes || 5,
        claps: a.claps || 140,
        heroImage: a.heroImage,
        caption: a.caption,
        toc: (a.toc || []) as any,
        proseHtml: a.proseHtml,
        tags: a.tags || [],
        authorId: authorWorkerId,
      },
    });
  }
  console.log(`✓ Seeded ${articles.length} articles.`);

  // 4. Seed Better Auth Accounts
  console.log('Seeding authentication accounts (Admin and Julian Vance)...');
  
  // Create Admin
  const adminEmail = 'admin@findworker.io';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await auth.api.signUpEmail({
      body: {
        name: 'Platform Administrator',
        email: adminEmail,
        password: 'admin123',
      },
    });
    // Elevate role to admin
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'admin' },
    });
    console.log(`✓ Created Admin Account: ${adminEmail} (password: admin123)`);
  } else {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'admin' },
    });
    console.log(`✓ Verified existing Admin Account: ${adminEmail}`);
  }

  // Create Freelancer (Julian Vance)
  const freelancerEmail = 'julian@findworker.io';
  const existingFreelancer = await prisma.user.findUnique({ where: { email: freelancerEmail } });
  if (!existingFreelancer) {
    await auth.api.signUpEmail({
      body: {
        name: 'Julian Vance',
        email: freelancerEmail,
        password: 'freelancer123',
      },
    });
    // Link to worker-1
    await prisma.user.update({
      where: { email: freelancerEmail },
      data: {
        role: 'freelancer',
        workerProfileId: 'worker-1',
      },
    });
    console.log(`✓ Created Freelancer Account: ${freelancerEmail} (password: freelancer123) linked to worker-1`);
  } else {
    await prisma.user.update({
      where: { email: freelancerEmail },
      data: {
        role: 'freelancer',
        workerProfileId: 'worker-1',
      },
    });
    console.log(`✓ Verified existing Freelancer Account: ${freelancerEmail}`);
  }

  console.log('--- Database Seeding Completed Successfully! ---');
}

seed()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
