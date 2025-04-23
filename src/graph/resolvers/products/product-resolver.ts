import { dbClient } from "../../../client-orm.js";

export const getAllProducts = async () => {
  try {
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

    if (products.length === 0) {
      console.log("Không có sản phẩm nào trong cơ sở dữ liệu");
      return [];
    }

    products.forEach((product: any, index: number) => {
      console.log(`Sản phẩm ${index + 1}:`, {
        id: product.id,
        title: product.title,
        status: product.status,
        collections: product.collections,
        collectionsType: typeof product.collections,
      });
    });

    const result = products.map((product: any) => {
      try {
        let collections = [];
        try {
          if (product.collections) {
            if (typeof product.collections === "string") {
              collections = JSON.parse(product.collections);
            } else if (typeof product.collections === "object") {
              collections = Array.isArray(product.collections)
                ? product.collections
                : [];
            }
            console.log(`Collections của sản phẩm ${product.id}:`, collections);
          }
        } catch (parseError) {
          console.error(
            `Lỗi khi xử lý collections của sản phẩm ${product.id}:`,
            parseError
          );
          collections = [];
        }

        const images =
          product.products_files && product.products_files.length > 0
            ? product.products_files
                .map((pf: any) => pf.directus_files)
                .filter(Boolean)
            : [];

        const tags =
          product.tags_products && product.tags_products.length > 0
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
          createdAt:
            product.date_created?.toISOString() || new Date().toISOString(),
          updatedAt:
            product.date_updated?.toISOString() || new Date().toISOString(),
        };
      } catch (error) {
        console.error(`Lỗi khi xử lý sản phẩm ${product.id}:`, error);
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
          createdAt:
            product.date_created?.toISOString() || new Date().toISOString(),
          updatedAt:
            product.date_updated?.toISOString() || new Date().toISOString(),
        };
      }
    });

    console.log(`Đã chuyển đổi ${result.length} sản phẩm`);
    return result;
  } catch (error) {
    console.error("Error fetching products:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    console.log("Trả về mảng rỗng do lỗi");
    return [];
  }
};

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
    });

    if (!product) {
      return null;
    }

    let collections = [];
    try {
      if (product.collections) {
        if (typeof product.collections === "string") {
          collections = JSON.parse(product.collections);
        } else if (typeof product.collections === "object") {
          collections = Array.isArray(product.collections)
            ? product.collections
            : [];
        }
      }
    } catch (parseError) {
      console.error(
        `Lỗi khi xử lý collections của sản phẩm ${product.id}:`,
        parseError
      );
      collections = [];
    }

    const images =
      product.products_files && product.products_files.length > 0
        ? product.products_files
            .map((pf: any) => pf.directus_files)
            .filter(Boolean)
        : [];

    const tags =
      product.tags_products && product.tags_products.length > 0
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

export const getProductsByCollection = async (collectionId: number) => {
  try {
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
    });

    const result = products.map((product: any) => {
      let collections = [];
      try {
        if (product.collections) {
          if (typeof product.collections === "string") {
            collections = JSON.parse(product.collections);
          } else if (typeof product.collections === "object") {
            collections = Array.isArray(product.collections)
              ? product.collections
              : [];
          }
        }
      } catch (parseError) {
        console.error(
          `Lỗi khi xử lý collections của sản phẩm ${product.id}:`,
          parseError
        );
        collections = [];
      }

      const images =
        product.products_files && product.products_files.length > 0
          ? product.products_files
              .map((pf: any) => pf.directus_files)
              .filter(Boolean)
          : [];

      const tags =
        product.tags_products && product.tags_products.length > 0
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
    console.error(
      `Error fetching products for collection ${collectionId}:`,
      error
    );
    throw new Error(`Failed to fetch products for collection ${collectionId}`);
  }
};

export const productResolvers = {
  Product: {
    thumbnail: (parent: any) => parent.thumbnail,
    images: (parent: any) => parent.images,
    collections: (parent: any) => parent.collections,
    tags: (parent: any) => parent.tags,
  },
};

export const productQueryResolvers = {
  Query: {
    products: () => getAllProducts(),
    product: (_: any, { id }: { id: number }) => getProductById(id),
    productsByCollection: (
      _: any,
      { collectionId }: { collectionId: number }
    ) => getProductsByCollection(collectionId),
  },
};
