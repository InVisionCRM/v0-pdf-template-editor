import { getGoogleDriveService } from './google-drive';
import { prisma } from './db';

/**
 * Contract service for handling PDF generation and Google Drive uploads
 */
export class ContractService {
  private googleDrive = getGoogleDriveService();

  /**
   * Save a contract with PDF upload to Google Drive
   */
  async saveContractWithUpload(
    leadId: string,
    contractType: string,
    formData: Record<string, any>,
    pdfBuffer: Buffer,
    userId?: string
  ) {
    try {
      // Get lead information for filename
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      if (!lead) {
        throw new Error('Lead not found');
      }

      // Upload to Google Drive
      const driveResult = await this.googleDrive.uploadContract(
        pdfBuffer,
        `${contractType}-Contract`,
        contractType,
        {
          firstName: lead.firstName || 'Unknown',
          lastName: lead.lastName || 'Unknown',
          leadId: leadId,
        }
      );

      // Save contract to database
      const contract = await prisma.contract.create({
        data: {
          leadId,
          contractType,
          signatures: formData.signatures || {},
          dates: formData.dates || {},
          names: formData.names || {},
          addresses: formData.addresses || {},
          contactInfo: formData.contactInfo || {},
          pdfUrl: driveResult.webViewLink,
          googleDriveFileId: driveResult.fileId,
          googleDriveLink: driveResult.webViewLink,
          uploadedAt: new Date(),
          fileName: `${lead.firstName}_${lead.lastName}_${contractType}_${new Date().toISOString().split('T')[0]}.pdf`,
        },
      });

      // Log activity
      if (userId) {
        await prisma.activity.create({
          data: {
            type: 'CONTRACT_CREATED',
            description: `${contractType} contract created and uploaded to Google Drive`,
            leadId,
            userId,
          },
        });
      }

      return {
        contract,
        driveFileId: driveResult.fileId,
        driveLink: driveResult.webViewLink,
        downloadLink: driveResult.webContentLink,
      };
    } catch (error) {
      console.error('Error saving contract with upload:', error);
      throw new Error(`Failed to save contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get contracts for a lead
   */
  async getContractsForLead(leadId: string) {
    return await prisma.contract.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
      include: {
        lead: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get contract by ID
   */
  async getContract(contractId: string) {
    return await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        lead: true,
      },
    });
  }

  /**
   * Delete contract and remove from Google Drive
   */
  async deleteContract(contractId: string) {
    const contract = await this.getContract(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    // Delete from Google Drive if exists
    if (contract.googleDriveFileId) {
      try {
        await this.googleDrive.deleteFile(contract.googleDriveFileId);
      } catch (error) {
        console.error('Error deleting from Google Drive:', error);
        // Continue with database deletion even if Drive deletion fails
      }
    }

    // Delete from database
    await prisma.contract.delete({
      where: { id: contractId },
    });
  }
}

// Singleton instance
let contractServiceInstance: ContractService | null = null;

export function getContractService(): ContractService {
  if (!contractServiceInstance) {
    contractServiceInstance = new ContractService();
  }
  return contractServiceInstance;
}