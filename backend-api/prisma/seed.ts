import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PASSWORD = 'Password123!'; // Same password for all demo users

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data (order matters for FKs)
  await prisma.notification.deleteMany();
  await prisma.clinicalNote.deleteMany();
  await prisma.message.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.news.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.practitioner.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // 1. Company
  const company = await prisma.company.create({
    data: {
      name: 'HuntZen Demo',
      slug: 'huntzen-demo',
      legalName: 'HuntZen Demo SAS',
      siret: '12345678901234',
      sector: 'Santé & Bien-être',
      address: '123 Avenue des Champs-Élysées',
      city: 'Paris',
      country: 'France',
      isActive: true,
      validatedAt: new Date(),
    },
  });
  console.log('  ✓ Company created:', company.name);

  // 2. Admin users (Super Admin, Admin HuntZen, Admin RH)
  const userSuperAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@huntzen.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log('  ✓ Super Admin created: superadmin@huntzen.com');

  const userAdminHuntzen = await prisma.user.create({
    data: {
      email: 'admin@huntzen.com',
      passwordHash,
      role: 'ADMIN_HUNTZEN',
      isActive: true,
    },
  });
  console.log('  ✓ Admin HuntZen created: admin@huntzen.com');

  const userAdminRH = await prisma.user.create({
    data: {
      email: 'admin.rh@huntzen-demo.com',
      passwordHash,
      role: 'ADMIN_RH',
      companyId: company.id,
      isActive: true,
    },
  });
  console.log('  ✓ Admin RH created: admin.rh@huntzen-demo.com');

  // 3. Employee user (Marc) + Employee
  const userMarc = await prisma.user.create({
    data: {
      email: 'marc@huntzen-demo.com',
      passwordHash,
      role: 'EMPLOYEE',
      companyId: company.id,
      isActive: true,
    },
  });

  const employeeMarc = await prisma.employee.create({
    data: {
      userId: userMarc.id,
      companyId: company.id,
      firstName: 'Marc',
      lastName: 'Dupont',
      department: 'Engineering',
      position: 'Développeur',
      phoneNumber: '+33612345678',
      bio: 'Passionné par le bien-être au travail.',
    },
  });
  console.log('  ✓ Employee created: Marc Dupont (marc@huntzen-demo.com)');

  // 4. Practitioner users + Practitioners
  const userSophie = await prisma.user.create({
    data: {
      email: 'sophie.martin@huntzen-care.com',
      passwordHash,
      role: 'PRACTITIONER',
      isActive: true,
    },
  });

  const practitionerSophie = await prisma.practitioner.create({
    data: {
      userId: userSophie.id,
      firstName: 'Sophie',
      lastName: 'Martin',
      title: 'Dr.',
      professionalId: 'PSY-SM-001',
      specialty: 'PSYCHOLOGUE_CLINICIEN',
      subSpecialties: ['Thérapie Cognitivo-Comportementale (TCC)', 'Pleine conscience'],
      languages: ['Français', 'Anglais'],
      bio: 'Psychologue clinicienne spécialisée dans la gestion du stress et de l\'anxiété en milieu professionnel. Formée aux TCC et à la pleine conscience.',
      experience: 12,
      education: 'DESS Psychologie Clinique, Université Paris Descartes',
      offersVideo: true,
      offersPhone: true,
      isValidated: true,
      validatedAt: new Date(),
      isActive: true,
      isAcceptingNewClients: true,
      defaultDuration: 50,
      timezone: 'Europe/Paris',
    },
  });

  const userThomas = await prisma.user.create({
    data: {
      email: 'thomas.bernard@huntzen-care.com',
      passwordHash,
      role: 'PRACTITIONER',
      isActive: true,
    },
  });

  const practitionerThomas = await prisma.practitioner.create({
    data: {
      userId: userThomas.id,
      firstName: 'Thomas',
      lastName: 'Bernard',
      title: 'M.',
      professionalId: 'PSY-TB-002',
      specialty: 'PSYCHOLOGUE_TRAVAIL',
      subSpecialties: ['Burn-out', 'Management'],
      languages: ['Français'],
      bio: 'Psychologue du travail, expert en prévention des risques psychosociaux et accompagnement des équipes.',
      experience: 8,
      education: 'Master Psychologie du Travail, INETOP',
      offersVideo: true,
      offersPhone: true,
      isValidated: true,
      validatedAt: new Date(),
      isActive: true,
      isAcceptingNewClients: true,
      defaultDuration: 50,
      timezone: 'Europe/Paris',
    },
  });
  console.log('  ✓ Practitioners created: Dr. Sophie Martin, M. Thomas Bernard');

  // 5. Availabilities (Mon–Fri 9–17)
  for (const p of [practitionerSophie, practitionerThomas]) {
    for (let day = 1; day <= 5; day++) {
      await prisma.availability.create({
        data: {
          practitionerId: p.id,
          type: 'RECURRING',
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          slotDuration: 50,
          isActive: true,
        },
      });
    }
  }
  console.log('  ✓ Availabilities created');

  // 6. Consultations (2 upcoming, 1 past)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const consults = [
    {
      scheduledAt: new Date(tomorrow.getTime() + 10 * 60 * 60 * 1000),
      scheduledEndAt: new Date(tomorrow.getTime() + 10 * 60 * 60 * 1000 + 50 * 60 * 1000),
      practitionerId: practitionerSophie.id,
      format: 'VIDEO' as const,
      status: 'SCHEDULED' as const,
      roomName: `huntzen-${Date.now()}-a1b2c3`,
    },
    {
      scheduledAt: new Date(nextWeek.getTime() + 14 * 60 * 60 * 1000),
      scheduledEndAt: new Date(nextWeek.getTime() + 14 * 60 * 60 * 1000 + 50 * 60 * 1000),
      practitionerId: practitionerThomas.id,
      format: 'VIDEO' as const,
      status: 'SCHEDULED' as const,
      roomName: `huntzen-${Date.now()}-d4e5f6`,
    },
    {
      scheduledAt: new Date(lastWeek.getTime() + 11 * 60 * 60 * 1000),
      scheduledEndAt: new Date(lastWeek.getTime() + 11 * 60 * 60 * 1000 + 50 * 60 * 1000),
      practitionerId: practitionerSophie.id,
      format: 'VIDEO' as const,
      status: 'COMPLETED' as const,
      roomName: `huntzen-${Date.now()}-g7h8i9`,
    },
  ];

  const createdConsultations: { id: string }[] = [];
  for (const c of consults) {
    const cons = await prisma.consultation.create({
      data: {
        companyId: company.id,
        employeeId: employeeMarc.id,
        practitionerId: c.practitionerId,
        scheduledAt: c.scheduledAt,
        scheduledEndAt: c.scheduledEndAt,
        duration: 50,
        format: c.format,
        status: c.status,
        roomName: c.roomName,
      },
    });
    createdConsultations.push(cons);
  }
  console.log('  ✓ Consultations created (2 upcoming, 1 completed)');

  // Messages for first consultation
  if (createdConsultations[0]) {
    await prisma.message.createMany({
      data: [
        {
          consultationId: createdConsultations[0].id,
          senderId: userSophie.id,
          senderRole: 'PRACTITIONER',
          content: 'Bonjour Marc, n\'oubliez pas de pratiquer les exercices de respiration avant notre séance.',
        },
        {
          consultationId: createdConsultations[0].id,
          senderId: userMarc.id,
          senderRole: 'EMPLOYEE',
          content: 'Merci Dr. Martin, je m\'y mets dès ce soir.',
        },
      ],
    });
    console.log('  ✓ Messages created');
  }

  // 7. News (company-specific)
  const newsItems = [
    {
      title: '5 techniques de respiration pour gérer le stress au travail',
      content: 'Découvrez des exercices simples à pratiquer au bureau pour réduire le stress et l\'anxiété. La cohérence cardiaque et la respiration 4-7-8 sont particulièrement efficaces.',
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
      authorId: userSophie.id,
      authorName: 'Dr. Sophie Martin',
    },
    {
      title: 'Comment améliorer la qualité de votre sommeil',
      content: 'Le sommeil joue un rôle crucial sur la santé mentale. Hygiène du sommeil, horaires réguliers et environnement : nos conseils pour mieux dormir.',
      imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400',
      authorId: userThomas.id,
      authorName: 'M. Thomas Bernard',
    },
    {
      title: 'Burn-out : les signes qui doivent vous alerter',
      content: 'Épuisement, cynisme, perte d\'efficacité : reconnaître les symptômes du burn-out pour agir à temps. Prévention et accompagnement.',
      imageUrl: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=400',
      authorId: userThomas.id,
      authorName: 'M. Thomas Bernard',
    },
  ];

  for (const n of newsItems) {
    await prisma.news.create({
      data: {
        companyId: company.id,
        title: n.title,
        content: n.content,
        imageUrl: n.imageUrl,
        authorId: n.authorId,
        authorName: n.authorName,
        publishedAt: new Date(),
      },
    });
  }
  console.log('  ✓ News created');

  // 8. Journal entries (Marc)
  await prisma.journalEntry.create({
    data: {
      employeeId: employeeMarc.id,
      content: 'Première séance avec Dr. Martin demain. Un peu nerveux mais content d\'avoir pris rendez-vous.',
      mood: 'GOOD',
      tags: ['première séance', 'soutien'],
    },
  });
  await prisma.journalEntry.create({
    data: {
      employeeId: employeeMarc.id,
      content: 'Semaine chargée au bureau. J\'ai essayé les exercices de respiration recommandés, ça aide.',
      mood: 'NEUTRAL',
      tags: ['travail', 'respiration'],
    },
  });
  console.log('  ✓ Journal entries created');

  // 9. Notifications (Marc)
  await prisma.notification.createMany({
    data: [
      {
        userId: userMarc.id,
        type: 'CONSULTATION_REMINDER_24H',
        title: 'Rappel consultation',
        message: 'Votre séance avec Dr. Sophie Martin est prévue demain.',
        linkUrl: null,
        linkLabel: null,
        isRead: false,
      },
      {
        userId: userMarc.id,
        type: 'NEWS_PUBLISHED',
        title: 'Nouvel article',
        message: 'Un nouvel article bien-être est disponible.',
        linkUrl: null,
        linkLabel: null,
        isRead: false,
      },
    ],
  });
  console.log('  ✓ Notifications created');

  console.log('\n✅ Seed completed!\n');
  console.log('Login credentials (all passwords: Password123!):');
  console.log('  👑 Super Admin:      superadmin@huntzen.com');
  console.log('  🏢 Admin HuntZen:    admin@huntzen.com');
  console.log('  👔 Admin RH:         admin.rh@huntzen-demo.com');
  console.log('  👤 Employee (Marc):  marc@huntzen-demo.com');
  console.log('  👨‍⚕️ Practitioner:     sophie.martin@huntzen-care.com');
  console.log('  👨‍⚕️ Practitioner:     thomas.bernard@huntzen-care.com');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
