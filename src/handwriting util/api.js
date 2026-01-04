export async function predictFromJSON(jsonData, age, gender, baseUrl = "http://localhost:8000") {
  const body = { json_data: jsonData, age, gender };
  const res = await fetch(`${baseUrl}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
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