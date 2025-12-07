import {
  createBrowserRouter,
  redirect,
  type RouteObject,
} from "react-router";
import { layouts } from "@/presentation/layouts/layoutsMap";
import type { UserEntity, UserRole } from "@/domain/entities/user/UserEntity";
import { AuthRepositoryApi } from "@/data/repositories/auth/AuthRepositoryApi";
import { queryClient } from "../utils/queryClient/queryClient";
interface RouteMeta {
  path: string;
  auth?: boolean;
  roles?: UserRole[];
  layout?: keyof typeof layouts;
  mainForRole?: UserRole;
}

const metaModules = import.meta.glob<{ default: RouteMeta }>(
  "@/presentation/views/**/*.meta.ts",
  { eager: true }
);

const pageModules = import.meta.glob("@/presentation/views/**/*.page.tsx");

const createLazyComponent = (filePath: string, meta: RouteMeta) => {
  return async () => {
    const mod = await pageModules[filePath]() as { default: React.ComponentType };
    const Component = mod.default;
    const Layout = layouts[meta.layout || "default"] ?? layouts.default;

    return {
      Component: () => (
        <Layout>
          <Component />
        </Layout>
      ),
    };
  };
};

const createLoader = (meta: RouteMeta) => {
  return async () => {
    let user = queryClient.getQueryData<UserEntity | null>(["currentUser"]);

    if (!user) {
      const authRepo = new AuthRepositoryApi();
      user = await authRepo.checkUser();
      queryClient.setQueryData(["currentUser"], user);
    }

    if (meta.auth && !user) throw redirect("/login");

    if (user) {
      localStorage.setItem("userId", user.id);

      if (meta.roles && !meta.roles.includes(user.role)) {
        throw redirect("/403");
      }

      if (meta.path === "/") {
        const mainMetaModule = Object.values(metaModules).find(
          (m) => m.default.mainForRole === user.role
        );

        if (mainMetaModule) {
          throw redirect(mainMetaModule.default.path);
        }
        throw redirect("/home");
      }
    }

    return null;
  };
};



const routes: RouteObject[] = Object.entries(metaModules)
  .map(([metaPath, metaModule]): RouteObject | null => {
    const meta = metaModule.default;
    const pagePath = metaPath.replace(/\.meta\.ts$/, ".page.tsx");

    const path = meta.path;
    if (!path || !(pagePath in pageModules)) return null;

    return {
      path,
      lazy: createLazyComponent(pagePath, meta),
      loader: createLoader(meta),
    } as RouteObject;
  })
  .filter((r): r is RouteObject => r !== null);

export const router = createBrowserRouter(routes);
