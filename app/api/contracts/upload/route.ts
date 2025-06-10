import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getContractService } from '@/lib/contract-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const pdfFile = formData.get('pdf') as File;
    const leadId = formData.get('leadId') as string;
    const contractType = formData.get('contractType') as string;
    const contractData = formData.get('contractData') as string;

    if (!pdfFile || !leadId || !contractType) {
      return NextResponse.json(
        { error: 'Missing required fields: pdf, leadId, contractType' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // Parse contract data
    let parsedContractData = {};
    try {
      parsedContractData = contractData ? JSON.parse(contractData) : {};
    } catch (error) {
      console.error('Error parsing contract data:', error);
    }

    const contractService = getContractService();
    const result = await contractService.saveContractWithUpload(
      leadId,
      contractType,
      parsedContractData,
      pdfBuffer,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      contract: result.contract,
      googleDriveFileId: result.driveFileId,
      viewLink: result.driveLink,
      downloadLink: result.downloadLink,
    });
  } catch (error) {
    console.error('Error uploading contract:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload contract' },
      { status: 500 }
    );
  }
} 