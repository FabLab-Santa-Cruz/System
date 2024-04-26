import { z } from "zod";
import { db } from "~/server/db";

export async function GET() {
  return new Response("Get a POST");
}
export async function POST(req: Request) {

  const zodSchema = z.object({
    whoId: z.string(),
    date: z.string().datetime(),
  })
  //validate schema
  let data = null
  try {
    data = await req.json() as unknown
  } catch (error) {
    return new Response("Invalid request body, malformed JSON", { status: 400 });
  }
  try {
    zodSchema.parse(data);
  } catch (error) {

    return new Response("Invalid request body, must follow schema", { status: 400 });
  }
  //check that whoId exists
  const infer = data as z.infer<typeof zodSchema>;
  
  const who = await db.volunteers.findUnique({
    where: {
      id: infer.whoId
    }
  })
  if (!who) {
    return new Response("Volunteer not found on DB", { status: 404 });
  }
  const mark = await db.biometricPosts.create({
    data: {
      date: infer.date,
      whoId: infer.whoId,
    },

  })
  return new Response(
    JSON.stringify(mark)
  );
}
