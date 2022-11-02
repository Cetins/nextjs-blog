import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData() {
    //get file names under /posts
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames.map((fileName) => {
        //remove .md extensioin from file name to get id
        const id = fileName.replace(/\.md$/, '');

        //read markdown file as a string
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        //use gray-matter to parse the post metadata section
        const matterResults = matter(fileContents);

        //combine the data with the id
        return {
            id,
            ...matterResults.data,
        };
    });

    //sort posts by date
    return allPostsData.sort(({ date: a }, { date: b}) => {
        if (a<b) {
            return 1;
        } else if ( a>b) {
            return -1;
        } else {
            return 0;
        }
    });
}
// --------------------------------------------------------------------------------------------------->

// FETCH DATA FROM API ENDPOINT

// export async function getSortedPostsData() {
//     // Instead of the file system,
//     // fetch post data from an external API endpoint
//     const res = await fetch('..');
//     return res.json();
// }

// Next.js polyfills fetch() on both the client and server. You don't need to import it.

// --------------------------------------------------------------------------------------------------->

// You can also query the database directly:

// import someDatabaseSDK from 'someDatabaseSDK'

// const databaseClient = someDatabaseSDK.createClient(...)

// export async function getSortedPostsData() {
//   // Instead of the file system,
//   // fetch post data from a database
//   return databaseClient.query('SELECT posts...')
// }

export function getAllPostIds() {
    const fileNames = fs.readdirSync(postsDirectory);

    //returns an array that looks like this:
    // [
    //     {
    //         params: {
    //             id: 'sgr-ssr'
    //         }
    //     },
    //     {
    //         params: {
    //             id: 'pre-rendering'
    //         }
    //     }
    // ]

    return fileNames.map((fileName) => {
        return {
            params : {
                id: fileName.replace(/\.md$/, ''),
            },
        };
    });
}

export async function getPostData(id) {
    const fullPath = path.join(postsDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    //use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    //use remark to convert markdown into html string
    const processedContent = await remark()
        .use(html)
        .process(matterResult.content);
    const contentHtml = processedContent.toString();

    //combine the data with the id
    return {
        id,
        contentHtml,
        ...matterResult.data,
    };
}