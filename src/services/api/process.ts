export async function processFile(file: File) {
    const token = localStorage.getItem('googleToken');
    const formData = new FormData();
    formData.append('file', file);
  
    const response = await fetch('/api/process/file', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error('Failed to process file');
    }
  
    return response.json();
  }