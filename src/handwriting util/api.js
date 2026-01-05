export async function predictFromJSON(jsonData, age, gender, baseUrl = "http://localhost:8000") {
  const body = { json_data: jsonData, age, gender };
  
  try {
    const res = await fetch(`${baseUrl}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorText;
      } catch {
        // If not JSON, use the text as is
      }
      throw new Error(errorMessage);
    }
    
    return await res.json();
  } catch (error) {
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      throw new Error(`Failed to connect to backend server at ${baseUrl}. Please ensure the backend is running.`);
    }
    throw error;
  }
}

export async function predictFromFile(file, age, gender, baseUrl = "http://localhost:8000") {
  const fd = new FormData();
  fd.append("file", file, file.name);
  if (age != null) fd.append("age", age);
  if (gender) fd.append("gender", gender);
  const res = await fetch(`${baseUrl}/predict`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}