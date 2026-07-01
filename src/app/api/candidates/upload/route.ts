import { NextRequest, NextResponse } from 'next/server';
import { handleError } from '../../../../core/errors/handler';
import { PdfParserService } from '../../../../services/pdf-parser.service';
import { MatchingService } from '../../../../services/matching.service';
import { ValidationError } from '../../../../core/errors';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    let userId = formData.get('userId') as string | null;

    if (!file) {
      throw new ValidationError('Resume file is required for upload.');
    }

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      throw new ValidationError('Only PDF files are supported for candidate resume uploads.');
    }

    // Ensure a valid user exists in the database to prevent foreign key constraint failures
    if (!userId) {
      let defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        defaultUser = await prisma.user.create({
          data: {
            email: 'recruiter@hirewise.ai',
            passwordHash: 'placeholder_password_hash',
            name: 'Default Recruiter',
            role: 'recruiter',
          },
        });
      }
      userId = defaultUser.id;
    } else {
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) {
        throw new ValidationError(`User with ID ${userId} does not exist in the database.`);
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Extract raw text from PDF
    const resumeText = await PdfParserService.parsePdf(buffer);

    // 2. Parse using Gemini and save to Postgres
    const candidate = await MatchingService.createCandidateProfile(userId, resumeText);

    return NextResponse.json(
      {
        success: true,
        message: 'Resume parsed and candidate profile created successfully.',
        data: {
          id: candidate.id,
          candidateId: candidate.candidateId,
          name: candidate.name,
          headline: candidate.headline,
          location: candidate.location,
          yearsOfExperience: candidate.yearsOfExperience,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
