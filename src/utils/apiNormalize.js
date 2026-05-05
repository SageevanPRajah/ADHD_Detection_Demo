const toCamel = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      const normalizedKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      return [normalizedKey, toCamel(entry)];
    })
  );
};

export const normalizeApiRecord = (record) => toCamel(record);

export const normalizeApiList = (records = []) => records.map(normalizeApiRecord);
