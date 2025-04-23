import { dbClient } from "../../../client-orm.js";

// Hàm lấy tất cả tags
export const getAllTags = async () => {
    try {
        console.log("Bắt đầu lấy danh sách tags...");
        const tags = await dbClient.tags.findMany({
            where: {
                status: "published",
            },
            include: {
                tags_products: {
                    include: {
                        products: {
                            include: {
                                directus_files: true,
                                products_files: {
                                    include: {
                                        directus_files: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })

        console.log(`Tìm thấy ${tags.length} tags`);

        return tags.map((tag) => ({
            id: tag.id,
            title: tag.title || "",
            slug: tag.slug || "",
            description: tag.description || "",
            status: tag.status,
            products: tag.tags_products?.map((tp) => ({
                ...tp.products,
                images: tp.products?.products_files?.map(pf => pf.directus_files).filter(Boolean) || [],
            })).filter(Boolean) || [],
            createdAt: tag.date_created?.toISOString(),
            updatedAt: tag.date_updated?.toISOString(),
        }));
    } catch (error) {
        console.error("Lỗi khi lấy danh sách tags:", error);
        throw new Error("Không thể lấy danh sách tags");
    }
};

// Hàm lấy tag theo ID
export const getTagById = async (id: number) => {
    try {
        console.log(`Bắt đầu lấy tag với ID ${id}...`);
        const tag = await dbClient.tags.findUnique({
            where: {
                id,
            },
            include: {
                tags_products: {
                    include: {
                        products: {
                            include: {
                                directus_files: true,
                                products_files: {
                                    include: {
                                        directus_files: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })

        if (!tag) {
            console.log(`Không tìm thấy tag với ID ${id}`);
            return null;
        }

        console.log(`Đã tìm thấy tag ${tag.title}`);

        return {
            id: tag.id,
            title: tag.title || "",
            slug: tag.slug || "",
            description: tag.description || "",
            status: tag.status,
            products: tag.tags_products?.map((tp) => ({
                ...tp.products,
                images: tp.products?.products_files?.map(pf => pf.directus_files).filter(Boolean) || [],
            })).filter(Boolean) || [],
            createdAt: tag.date_created?.toISOString(),
            updatedAt: tag.date_updated?.toISOString(),
        };
    } catch (error) {
        console.error(`Lỗi khi lấy tag với ID ${id}:`, error);
        throw new Error(`Không thể lấy tag với ID ${id}`);
    }
};

// Resolvers cho Tag type
export const tagResolvers = {
    Tag: {
        products: (parent: any) => parent.products || [],
    },
};

export const tagQueryResolvers = {
    Query: {
        tags: () => getAllTags(),
        tag: (_: any, { id }: { id: number }) => getTagById(id),
    },
}; 