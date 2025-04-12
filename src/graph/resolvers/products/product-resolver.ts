import { dbClient } from "../../../client-orm.js";

const checkDatabaseConnection = async () => {
    try {
        console.log("Đang kiểm tra kết nối cơ sở dữ liệu...");
        const result = await dbClient.$queryRaw`SELECT 1 as connected`;
        console.log("Kết nối cơ sở dữ liệu thành công:", result);
        return true;
    } catch (error) {
        console.error("Lỗi kết nối cơ sở dữ liệu:", error);
        return false;
    }
};

const checkProductsTable = async () => {
    try {
        console.log("Đang kiểm tra cấu trúc bảng products...");
        // Thực hiện một truy vấn để lấy thông tin về bảng products
        const tableInfo = await dbClient.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products'
    `;
        console.log("Cấu trúc bảng products:", tableInfo);
        return true;
    } catch (error) {
        console.error("Lỗi khi kiểm tra cấu trúc bảng products:", error);
        return false;
    }
};

// Kiểm tra dữ liệu trong bảng products
const checkProductsData = async () => {
    try {
        console.log("Đang kiểm tra dữ liệu trong bảng products...");
        // Thực hiện một truy vấn để lấy dữ liệu từ bảng products
        const productsData = await dbClient.$queryRaw`
      SELECT id, title, status, collections 
      FROM products 
      LIMIT 5
    `;
        console.log("Dữ liệu trong bảng products:", productsData);
        return true;
    } catch (error) {
        console.error("Lỗi khi kiểm tra dữ liệu trong bảng products:", error);
        return false;
    }
};

export const createSampleProducts = async () => {
    try {
        const count = await dbClient.products.count();

        if (count === 0) {
            console.log("Chưa có sản phẩm nào, đang tạo sản phẩm mẫu...");

            const collection = await dbClient.collections.create({
                data: {
                    title: "Sản phẩm mẫu",
                    description: "Bộ sưu tập sản phẩm mẫu",
                    status: "published",
                },
            });

            const product = await dbClient.products.create({
                data: {
                    title: "Sản phẩm mẫu 1",
                    description: "Mô tả sản phẩm mẫu 1",
                    price: 100000,
                    slug: "san-pham-mau-1",
                    collections: JSON.stringify([collection.id]),
                    status: "published",
                },
            });

            console.log(`Đã tạo sản phẩm mẫu với ID: ${product.id}`);
            return product;
        } else {
            console.log(`Đã có ${count} sản phẩm trong cơ sở dữ liệu`);
            return null;
        }
    } catch (error) {
        console.error("Error creating sample products:", error);
        throw new Error("Failed to create sample products");
    }
};

export const getAllProducts = async () => {
    try {
        const isConnected = await checkDatabaseConnection();
        if (!isConnected) {
            console.error("Không thể kết nối đến cơ sở dữ liệu");
            return [];
        }

        await checkProductsTable();

        await checkProductsData();

        await createSampleProducts();

        const products = await dbClient.products.findMany({
            include: {
                directus_files: true,
                products_files: {
                    include: {
                        directus_files: true,
                    },
                },
                tags_products: {
                    include: {
                        tags: true,
                    },
                },
            },
        });

        // Nếu không có sản phẩm nào, trả về mảng rỗng
        if (products.length === 0) {
            console.log("Không có sản phẩm nào trong cơ sở dữ liệu");
            return [];
        }

        // Log chi tiết từng sản phẩm để debug
        products.forEach((product: any, index: number) => {
            console.log(`Sản phẩm ${index + 1}:`, {
                id: product.id,
                title: product.title,
                status: product.status,
                collections: product.collections,
                collectionsType: typeof product.collections,
            });
        });

        // Chuyển đổi dữ liệu và log để debug
        const result = products.map((product: any) => {
            try {
                // Xử lý collections
                let collections = [];
                try {
                    if (product.collections) {
                        // Kiểm tra kiểu dữ liệu của collections
                        if (typeof product.collections === 'string') {
                            // Nếu là chuỗi, thử parse JSON
                            collections = JSON.parse(product.collections);
                        } else if (typeof product.collections === 'object') {
                            // Nếu đã là đối tượng, sử dụng trực tiếp
                            collections = Array.isArray(product.collections) ? product.collections : [];
                        }
                        console.log(`Collections của sản phẩm ${product.id}:`, collections);
                    }
                } catch (parseError) {
                    console.error(`Lỗi khi xử lý collections của sản phẩm ${product.id}:`, parseError);
                    collections = [];
                }

                // Xử lý images
                const images = product.products_files && product.products_files.length > 0
                    ? product.products_files.map((pf: any) => pf.directus_files).filter(Boolean)
                    : [];

                // Xử lý tags
                const tags = product.tags_products && product.tags_products.length > 0
                    ? product.tags_products.map((tp: any) => tp.tags).filter(Boolean)
                    : [];

                return {
                    id: product.id,
                    title: product.title || "Không có tiêu đề",
                    description: product.description || "Không có mô tả",
                    thumbnail: product.directus_files,
                    price: product.price || 0,
                    slug: product.slug || `product-${product.id}`,
                    collections: collections,
                    images: images,
                    tags: tags,
                    status: product.status || "draft",
                    createdAt: product.date_created?.toISOString() || new Date().toISOString(),
                    updatedAt: product.date_updated?.toISOString() || new Date().toISOString(),
                };
            } catch (error) {
                console.error(`Lỗi khi xử lý sản phẩm ${product.id}:`, error);
                // Trả về sản phẩm với dữ liệu tối thiểu nếu có lỗi
                return {
                    id: product.id,
                    title: product.title || "Không có tiêu đề",
                    description: product.description || "Không có mô tả",
                    thumbnail: null,
                    price: product.price || 0,
                    slug: product.slug || `product-${product.id}`,
                    collections: [],
                    images: [],
                    tags: [],
                    status: product.status || "draft",
                    createdAt: product.date_created?.toISOString() || new Date().toISOString(),
                    updatedAt: product.date_updated?.toISOString() || new Date().toISOString(),
                };
            }
        });

        console.log(`Đã chuyển đổi ${result.length} sản phẩm`);
        return result;
    } catch (error) {
        console.error("Error fetching products:", error);
        // Log chi tiết lỗi để debug
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        // Trả về mảng rỗng thay vì throw error
        console.log("Trả về mảng rỗng do lỗi");
        return [];
    }
};

// Hàm lấy sản phẩm theo ID
export const getProductById = async (id: number) => {
    try {
        const product = await dbClient.products.findUnique({
            where: {
                id,
            },
            include: {
                directus_files: true,
                products_files: {
                    include: {
                        directus_files: true,
                    },
                },
                tags_products: {
                    include: {
                        tags: true,
                    },
                },
            },
        })

        if (!product) {
            return null;
        }

        // Xử lý collections tương tự như trong getAllProducts
        let collections = [];
        try {
            if (product.collections) {
                // Kiểm tra kiểu dữ liệu của collections
                if (typeof product.collections === 'string') {
                    // Nếu là chuỗi, thử parse JSON
                    collections = JSON.parse(product.collections);
                } else if (typeof product.collections === 'object') {
                    // Nếu đã là đối tượng, sử dụng trực tiếp
                    collections = Array.isArray(product.collections) ? product.collections : [];
                }
                console.log(`Collections của sản phẩm ${product.id}:`, collections);
            }
        } catch (parseError) {
            console.error(`Lỗi khi xử lý collections của sản phẩm ${product.id}:`, parseError);
            collections = [];
        }

        // Xử lý images cho getProductById
        const images = product.products_files && product.products_files.length > 0
            ? product.products_files.map((pf: any) => pf.directus_files).filter(Boolean)
            : [];

        // Xử lý tags cho getProductById
        const tags = product.tags_products && product.tags_products.length > 0
            ? product.tags_products.map((tp: any) => tp.tags).filter(Boolean)
            : [];

        return {
            id: product.id,
            title: product.title,
            description: product.description,
            thumbnail: product.directus_files,
            price: product.price,
            slug: product.slug,
            collections: collections,
            images: images,
            tags: tags,
            status: product.status,
            createdAt: product.date_created?.toISOString(),
            updatedAt: product.date_updated?.toISOString(),
        };
    } catch (error) {
        console.error(`Error fetching product with ID ${id}:`, error);
        throw new Error(`Failed to fetch product with ID ${id}`);
    }
};

// Hàm lấy sản phẩm theo collection
export const getProductsByCollection = async (collectionId: number) => {
    try {
        const collection = await dbClient.collections.findUnique({
            where: {
                id: collectionId,
            },
        });

        if (!collection) {
            return [];
        }

        // Sử dụng string_contains thay vì contains
        const products = await dbClient.products.findMany({
            where: {
                status: "published",
                collections: {
                    string_contains: collectionId.toString(),
                },
            },
            include: {
                directus_files: true,
                products_files: {
                    include: {
                        directus_files: true,
                    },
                },
                tags_products: {
                    include: {
                        tags: true,
                    },
                },
            },
        })

        // Xử lý sản phẩm trong getProductsByCollection
        const result = products.map((product: any) => {
            // Xử lý collections tương tự như trong các hàm khác
            let collections = [];
            try {
                if (product.collections) {
                    // Kiểm tra kiểu dữ liệu của collections
                    if (typeof product.collections === 'string') {
                        // Nếu là chuỗi, thử parse JSON
                        collections = JSON.parse(product.collections);
                    } else if (typeof product.collections === 'object') {
                        // Nếu đã là đối tượng, sử dụng trực tiếp
                        collections = Array.isArray(product.collections) ? product.collections : [];
                    }
                }
            } catch (parseError) {
                console.error(`Lỗi khi xử lý collections của sản phẩm ${product.id}:`, parseError);
                collections = [];
            }

            collections.forEach((collection: any) => {
                // Xử lý từng collection nếu cần
            });

            // Xử lý images cho getProductsByCollection
            const images = product.products_files && product.products_files.length > 0
                ? product.products_files.map((pf: any) => pf.directus_files).filter(Boolean)
                : [];

            // Xử lý tags cho getProductsByCollection
            const tags = product.tags_products && product.tags_products.length > 0
                ? product.tags_products.map((tp: any) => tp.tags).filter(Boolean)
                : [];

            return {
                id: product.id,
                title: product.title,
                description: product.description,
                thumbnail: product.directus_files,
                price: product.price,
                slug: product.slug,
                collections: collections,
                images: images,
                tags: tags,
                status: product.status,
                createdAt: product.date_created?.toISOString(),
                updatedAt: product.date_updated?.toISOString(),
            };
        });

        return result;
    } catch (error) {
        console.error(`Error fetching products for collection ${collectionId}:`, error);
        throw new Error(`Failed to fetch products for collection ${collectionId}`);
    }
};

// Hàm lấy tất cả collections
export const getAllCollections = async () => {
    try {
        const collections = await dbClient.collections.findMany({
            where: {
                status: "published",
            },
            include: {
                directus_files: true,
            },
        })

        // Xử lý collections trong getAllCollections
        return collections.map((collection: any) => ({
            id: collection.id,
            title: collection.title,
            description: collection.description,
            status: collection.status,
            createdAt: collection.date_created?.toISOString(),
            updatedAt: collection.date_updated?.toISOString(),
        }));
    } catch (error) {
        console.error("Error fetching collections:", error);
        throw new Error("Failed to fetch collections");
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
        })

        if (!collection) {
            return null;
        }

        return {
            id: collection.id,
            title: collection.title,
            description: collection.description,
            thumbnail: collection.directus_files,
            status: collection.status,
            createdAt: collection.date_created?.toISOString(),
            updatedAt: collection.date_updated?.toISOString(),
        };
    } catch (error) {
        console.error(`Error fetching collection with ID ${id}:`, error);
        throw new Error(`Failed to fetch collection with ID ${id}`);
    }
};

// Resolvers cho Product type
export const productResolvers = {
    Product: {
        thumbnail: (parent: any) => parent.thumbnail,
        images: (parent: any) => parent.images,
        collections: (parent: any) => parent.collections,
        tags: (parent: any) => parent.tags,
    },
};

// Resolvers cho Collection type
export const collectionResolvers = {
    Collection: {
        thumbnail: (parent: any) => parent.thumbnail,
    },
};

// Resolvers cho Tag type
export const tagResolvers = {
    Tag: {
        // Có thể thêm các resolver con cho Tag nếu cần
    },
};

export const productQueryResolvers = {
    Query: {
        products: () => getAllProducts(),
        product: (_: any, { id }: { id: number }) => getProductById(id),
        productsByCollection: (_: any, { collectionId }: { collectionId: number }) => getProductsByCollection(collectionId),
        collections: () => getAllCollections(),
        collection: (_: any, { id }: { id: number }) => getCollectionById(id),
    },
}; 