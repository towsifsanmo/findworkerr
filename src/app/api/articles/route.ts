import { getAllArticles } from '@/server/services/article.service';
import { successResponse, serverErrorResponse } from '@/server/utils/response';

export async function GET() {
  try {
    const articles = await getAllArticles();
    return successResponse(articles);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to fetch field notes articles.');
  }
}

