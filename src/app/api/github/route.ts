import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'GitHub URL is required' }, { status: 400 });
    }

    // Basic regex to extract owner and repo from https://github.com/owner/repo
    const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex);

    if (!match) {
      return NextResponse.json({ error: 'Invalid GitHub URL format' }, { status: 400 });
    }

    const owner = match[1];
    const repo = match[2].replace('.git', '');

    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Smart-Readme-Generator',
    };

    // Fetch repo details
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      if (repoRes.status === 404) return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
      if (repoRes.status === 403) return NextResponse.json({ error: 'GitHub API rate limit exceeded' }, { status: 403 });
      return NextResponse.json({ error: 'Failed to fetch repository details' }, { status: repoRes.status });
    }
    const repoData = await repoRes.json();

    // Fetch languages
    const langsRes = await fetch(repoData.languages_url, { headers });
    const langsData = langsRes.ok ? await langsRes.json() : {};

    // Fetch default branch tree
    const defaultBranch = repoData.default_branch;
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers });
    let fileTree = [];
    if (treeRes.ok) {
      const treeData = await treeRes.json();
      fileTree = treeData.tree.map((item: any) => item.path);
      // Truncate if too large to avoid massive payloads
      if (fileTree.length > 500) {
        fileTree = fileTree.slice(0, 500);
        fileTree.push('... (truncated)');
      }
    }

    return NextResponse.json({
      description: repoData.description,
      languages: Object.keys(langsData),
      fileTree,
      name: repoData.name,
      owner: owner
    });

  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
