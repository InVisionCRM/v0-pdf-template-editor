import { getGoogleDriveService } from './google-drive';

/**
 * Test function to verify Google Drive integration
 */
export async function testGoogleDriveIntegration() {
  try {
    console.log('Testing Google Drive integration...');
    
    const googleDrive = getGoogleDriveService();
    
    // Create a simple test PDF buffer
    const testPdfContent = Buffer.from(
      '%PDF-1.3\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n174\n%%EOF'
    );

    const result = await googleDrive.uploadContract(
      testPdfContent,
      'Test-Contract',
      'Test Contract',
      {
        firstName: 'Test',
        lastName: 'User',
        leadId: 'TEST-123',
      }
    );

    console.log('✅ Google Drive integration test successful!');
    console.log('File ID:', result.fileId);
    console.log('View Link:', result.webViewLink);
    console.log('Download Link:', result.webContentLink);

    return result;
  } catch (error) {
    console.error('❌ Google Drive integration test failed:', error);
    throw error;
  }
} 