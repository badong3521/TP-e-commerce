import { dbClient } from "../../../client-orm.js";

// Hàm lấy tất cả collections
export const getAllCollections = async () => {
  try {
    const collections = await dbClient.collections.findMany({
      where: {
        status: {
          in: ["published", "draft"],
        },
      },
      include: {
        directus_files: true,
      },
    });

    const mappedCollections = collections.map((collection) => ({
      id: collection.id,
      title: collection.title || "",
      description: collection.description || "",
      thumbnail: collection.directus_files || null,
      status: collection.status || "draft",
      createdAt: collection.date_created?.toISOString() || null,
      updatedAt: collection.date_updated?.toISOString() || null,
    }));

    // Đảm bảo luôn trả về một mảng không null
    return mappedCollections;
  } catch (error: any) {
    console.error("Lỗi chi tiết khi lấy danh sách collections:", {
      error,
      stack: error.stack,
      message: error.message,
    });
    return [];
  }
};

// Hàm lấy collection theo ID
export const getCollectionById = async (id: number) => {
  try {
    const collection = await dbClient.collections.findUnique({
      where: {
        id,
      },
      include: {
        directus_files: true,
      },
    });

    if (!collection) {
      return null;
    }

    return {
      id: collection.id,
      title: collection.title || "",
      description: collection.description || "",
      thumbnail: collection.directus_files,
      status: collection.status,
      createdAt: collection.date_created?.toISOString(),
      updatedAt: collection.date_updated?.toISOString(),
    };
  } catch (error) {
    console.error(`Lỗi khi lấy collection với ID ${id}:`, error);
    throw new Error(`Không thể lấy collection với ID ${id}`);
  }
};

// Resolvers cho Collection type
export const collectionResolvers = {
  Collection: {
    thumbnail: (parent: any) => parent.thumbnail,
  },
};

export const collectionQueryResolvers = {
  Query: {
    collections: () => getAllCollections(),
    collection: (_: any, { id }: { id: number }) => getCollectionById(id),
  },
};
