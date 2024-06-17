import { machinesRouter } from './routers/machines';
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { brandRouter } from "./routers/brands";
import { type inferReactQueryProcedureOptions } from "@trpc/react-query";
import { type inferRouterOutputs } from "@trpc/server";
import { uploadRouter } from "./routers/upload";
import { categoriesRouter } from "./routers/categories";
import { volunteersRouter } from "./routers/volunteers";
import { personsRouter } from "./routers/persons";
import { profileRouter } from "./routers/profile";
import { careerRouter } from "./routers/careers";
import { projectsRouter} from "./routers/projects";



/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  profile: profileRouter,
  brand: brandRouter,
  upload: uploadRouter,
  category: categoriesRouter,
  volunteer: volunteersRouter,
  person: personsRouter,
  career: careerRouter,
  projects: projectsRouter,
  machines: machinesRouter
});
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type InferAPI = inferReactQueryProcedureOptions<AppRouter>

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
