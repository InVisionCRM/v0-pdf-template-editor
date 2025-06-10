import { google } from 'googleapis';

/**
 * Google Drive service for uploading contracts to shared drive
 */
class GoogleDriveService {
  private drive;

  constructor() {
    if (!process.env.GOOGLE_SA_EMAIL || !process.env.GOOGLE_SA_PRIVATE_KEY || !process.env.SHARED_DRIVE_ID) {
      throw new Error('Missing required Google Drive environment variables');
    }

    // Create service account auth
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SA_EMAIL,
      undefined,
      process.env.GOOGLE_SA_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/drive'],
      undefined
    );

    this.drive = google.drive({ version: 'v3', auth });
  }

  /**
   * Upload a PDF contract to Google Drive shared folder
   */
  async uploadContract(
    pdfBuffer: Buffer,
    fileName: string,
    contractType: string,
    leadInfo?: {
      firstName?: string;
      lastName?: string;
      leadId?: string;
    }
  ): Promise<{ fileId: string; webViewLink: string; webContentLink: string }> {
    try {
      // Generate filename based on your specified pattern: firstName, lastName, contractType
      const finalFileName = this.generateFileName(fileName, contractType, leadInfo);

      const fileMetadata = {
        name: finalFileName,
        parents: [process.env.SHARED_DRIVE_ID!],
        // Make sure it's uploaded to the shared drive
        driveId: process.env.SHARED_DRIVE_ID!,
      };

      const media = {
        mimeType: 'application/pdf',
        body: require('stream').Readable.from(pdfBuffer),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        supportsAllDrives: true, // Important for shared drives
        fields: 'id,webViewLink,webContentLink,name',
      });

      if (!response.data.id) {
        throw new Error('Failed to upload file to Google Drive');
      }

      // Set permissions to inherit from parent folder (shared with organization)
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'domain',
          domain: this.extractDomainFromEmail(), // Your organization domain
        },
        supportsAllDrives: true,
      });

      return {
        fileId: response.data.id,
        webViewLink: response.data.webViewLink || '',
        webContentLink: response.data.webContentLink || '',
      };
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      throw new Error(`Failed to upload contract to Google Drive: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate filename based on pattern: firstName, lastName, contractType
   */
  private generateFileName(
    originalFileName: string,
    contractType: string,
    leadInfo?: {
      firstName?: string;
      lastName?: string;
      leadId?: string;
    }
  ): string {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    if (leadInfo?.firstName && leadInfo?.lastName) {
      // Pattern: John_Doe_General_Contract_2024-12-07.pdf
      return `${leadInfo.firstName}_${leadInfo.lastName}_${contractType.replace(/\s+/g, '_')}_${timestamp}.pdf`;
    }
    
    // Fallback to original name with timestamp
    const nameWithoutExt = originalFileName.replace(/\.pdf$/i, '');
    return `${nameWithoutExt}_${contractType.replace(/\s+/g, '_')}_${timestamp}.pdf`;
  }

  /**
   * Extract domain from service account email for permissions
   */
  private extractDomainFromEmail(): string {
    const email = process.env.GOOGLE_SA_EMAIL!;
    return email.split('@')[1];
  }

  /**
   * Get file metadata from Google Drive
   */
  async getFileMetadata(fileId: string) {
    try {
      const response = await this.drive.files.get({
        fileId,
        supportsAllDrives: true,
        fields: 'id,name,webViewLink,webContentLink,createdTime,modifiedTime,size',
      });
      return response.data;
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a file from Google Drive
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({
        fileId,
        supportsAllDrives: true,
      });
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Singleton instance
let googleDriveServiceInstance: GoogleDriveService | null = null;

export function getGoogleDriveService(): GoogleDriveService {
  if (!googleDriveServiceInstance) {
    googleDriveServiceInstance = new GoogleDriveService();
  }
  return googleDriveServiceInstance;
}

export default GoogleDriveService; 