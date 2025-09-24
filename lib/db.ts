// This is a mock ORM (inspired by Prisma's API) used to simplify
// parts of the app not relevant to the demo. It is not intended
// as a learning resource or example of best practices.

import 'server-only';
import {
  data,
  type Category,
  type Demo,
  type DemoCategory,
  type DemoSlug,
  type Product,
  type Shape,
  type Material,
  type Section,
} from '../app/_internal/_data';

type ProductWhere = { id?: string; category?: string; section?: string };
type ProductFindOptions = { where?: ProductWhere; limit?: number };

type ShapeWhere = { id?: string; category?: string; section?: string };
type ShapeFindOptions = { where?: ShapeWhere; limit?: number };

type MaterialWhere = { id?: string; category?: string; section?: string };
type MaterialFindOptions = { where?: MaterialWhere; limit?: number };

type SectionWhere = { id?: string; slug?: string };
type SectionFindOptions = { where?: SectionWhere; limit?: number };

type CategoryWhere = { id?: string; slug?: string; section?: string };
type CategoryFindOptions = { where?: CategoryWhere };

type DemoWhere = { slug?: DemoSlug };
type DemoFindOptions = { where?: DemoWhere };

const db = {
  product: {
    find: (options: ProductFindOptions) => {
      let product: Product | undefined;

      if (options.where?.id !== undefined) {
        product = data.products.find((p) => p.id === options.where?.id);
      } else if (options.where?.category !== undefined) {
        product = data.products.find(
          (p) => p.category === options.where?.category,
        );
      }

      let prev: string | undefined = undefined;
      let next: string | undefined = undefined;

      if (product) {
        const ids = data.products.map((p) => Number(p.id));
        const currentIndex = ids.indexOf(Number(product.id));
        const prevIndex = (currentIndex - 1 + ids.length) % ids.length;
        const nextIndex = (currentIndex + 1) % ids.length;

        prev = data.products[prevIndex]?.id;
        next = data.products[nextIndex]?.id;
      }

      return product ? { ...product, prev, next } : null;
    },
    findMany: (options: ProductFindOptions = {}) => {
      let result = data.products;

      if (options.where?.category) {
        result = result.filter(
          (product) => product.category === options.where!.category,
        );
      }

      if (options.where?.section) {
        const sectionCategories = data.categories
          .filter((category) => category.section === options.where!.section)
          .map((category) => category.id);
        result = result.filter((product) =>
          sectionCategories.includes(product.category),
        );
      }

      if (options.limit !== undefined) {
        result = result.slice(0, options.limit);
      }

      return result;
    },
  },

  shape: {
    find: (options: ShapeFindOptions) => {
      let shape: Shape | undefined;

      if (options.where?.id !== undefined) {
        shape = data.shapes.find((p) => p.id === options.where?.id);
      } else if (options.where?.category !== undefined) {
        shape = data.shapes.find((p) => p.category === options.where?.category);
      }

      let prev: string | undefined = undefined;
      let next: string | undefined = undefined;

      if (shape) {
        const ids = data.shapes.map((p) => Number(p.id));
        const currentIndex = ids.indexOf(Number(shape.id));
        const prevIndex = (currentIndex - 1 + ids.length) % ids.length;
        const nextIndex = (currentIndex + 1) % ids.length;

        prev = data.shapes[prevIndex]?.id;
        next = data.shapes[nextIndex]?.id;
      }

      return shape ? { ...shape, prev, next } : null;
    },
    findMany: (options: ShapeFindOptions = {}) => {
      let result = data.shapes;

      if (options.where?.category) {
        result = result.filter(
          (shape) => shape.category === options.where!.category,
        );
      }

      if (options.where?.section) {
        const sectionCategories = data.categories
          .filter((category) => category.section === options.where!.section)
          .map((category) => category.id);
        result = result.filter((shape) =>
          sectionCategories.includes(shape.category),
        );
      }

      if (options.limit !== undefined) {
        result = result.slice(0, options.limit);
      }

      return result;
    },
  },

  material: {
    find: (options: MaterialFindOptions) => {
      let material: Material | undefined;

      if (options.where?.id !== undefined) {
        material = data.materials.find((p) => p.id === options.where?.id);
      } else if (options.where?.category !== undefined) {
        material = data.materials.find(
          (p) => p.category === options.where?.category,
        );
      }

      let prev: string | undefined = undefined;
      let next: string | undefined = undefined;

      if (material) {
        const ids = data.materials.map((p) => Number(p.id));
        const currentIndex = ids.indexOf(Number(material.id));
        const prevIndex = (currentIndex - 1 + ids.length) % ids.length;
        const nextIndex = (currentIndex + 1) % ids.length;

        prev = data.materials[prevIndex]?.id;
        next = data.materials[nextIndex]?.id;
      }

      return material ? { ...material, prev, next } : null;
    },

    findMany: (options: MaterialFindOptions = {}) => {
      let result = data.materials;

      if (options.where?.category) {
        result = result.filter((m) => m.category === options.where!.category);
      }

      if (options.where?.section) {
        const sectionCategories = data.categories
          .filter((category) => category.section === options.where!.section)
          .map((category) => category.id);
        result = result.filter((m) => sectionCategories.includes(m.category));
      }

      if (options.limit !== undefined) {
        result = result.slice(0, options.limit);
      }

      return result;
    },
  },

  section: {
    find: (options: SectionFindOptions) => {
      let section: Section | undefined;

      if (options.where?.id !== undefined) {
        section = data.sections.find((s) => s.id === options.where?.id);
      } else if (options.where?.slug !== undefined) {
        section = data.sections.find((s) => s.slug === options.where?.slug);
      }

      return section || null;
    },
    findMany: (options: SectionFindOptions = {}) => {
      let result = data.sections;

      if (options.where?.id) {
        result = result.filter((section) => section.id === options.where!.id);
      }

      if (options.where?.slug) {
        result = result.filter(
          (section) => section.slug === options.where!.slug,
        );
      }

      if (options.limit !== undefined) {
        result = result.slice(0, options.limit);
      }

      return result;
    },
  },

  category: {
    find: (options: CategoryFindOptions) => {
      let category: Category | undefined;

      if (options.where?.id !== undefined) {
        category = data.categories.find((c) => c.id === options.where?.id);
      } else if (options.where?.slug !== undefined) {
        category = data.categories.find((c) => c.slug === options.where?.slug);
      } else if (options.where?.section !== undefined) {
        category = data.categories.find(
          (c) => c.section === options.where?.section,
        );
      }

      return category || null;
    },
    findMany: (options: CategoryFindOptions = {}) => {
      let result = data.categories;

      if (options.where?.id) {
        result = result.filter((category) => category.id === options.where!.id);
      }

      if (options.where?.slug) {
        result = result.filter(
          (category) => category.slug === options.where!.slug,
        );
      }

      if (options.where?.section) {
        result = result.filter(
          (category) => category.section === options.where!.section,
        );
      }

      return result;
    },
  },

  demo: {
    find: (options: DemoFindOptions) => {
      let demo: Demo | undefined;

      if (options.where?.slug !== undefined) {
        for (const category of data.demos) {
          const found = category.items.find(
            (d) => d.slug === options.where?.slug,
          );
          if (found) {
            demo = found;
            break;
          }
        }
      }

      // More strict than other entities because demos are used to
      // build the site not just display data.
      if (typeof demo === 'undefined') {
        throw new Error(`Demo not found: ${options.where?.slug}`);
      }

      return demo;
    },
    findMany: () => {
      return data.demos;
    },
  },
};

export default db;

export type { Demo, Product, Section, Shape, Material, Category, DemoCategory };
