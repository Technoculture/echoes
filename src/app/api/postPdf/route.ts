// import { NextResponse } from "next/server";
// import { PDFLoader } from "langchain/document_loaders/fs/pdf";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { CharacterTextSplitter } from "langchain/text_splitter";
// import { OpenAIEmbeddings } from "langchain/embeddings/openai";
// import { Chroma } from "langchain/vectorstores/chroma";

// export async function POST(request: Request) {
//   const body = await request.formData();
//   console.log("body", body.get("pdf"));
//   const pdfBlob = body.get("pdf") as Blob;
//   const fileName = body.get("name") as string;
//   // const pdf = Buffer.from(pdfBlob.arrayBuffer())

//   // create docs with a loader
//   const loader = new PDFLoader(pdfBlob);
//   const docs = await loader.load();
//   // console.log("docs", docs[0].pageContent);

//   const splitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 1000,
//     chunkOverlap: 200,
//     // separators: ["\n\n", "\n", ".", " ", ""]
//   });

//   const docOutput = await splitter.splitDocuments(docs);
//   console.log(docOutput);

//   // Create vector store and index the docs

//   const vectorStore = await Chroma.fromDocuments(
//     docOutput,
//     new OpenAIEmbeddings({
//       openAIApiKey: process.env.OPEN_AI_API_KEY,
//     }),
//     {
//       collectionName: "test-collection",
//       url: process.env.CHROMA_URL,
//     },
//   );

//   // const vectorStore2 = await Chroma.fromExistingCollection(
//   //   new OpenAIEmbeddings({openAIApiKey: process.env.OPEN_AI_API_KEY}),
//   //   { collectionName: "a-test-collection",
//   //     url: `http://15.206.184.226:8000`
//   //   }
//   // )
//   // const response = await vectorStore.similaritySearch("Timing of antiretroviral therapy (ART) initiation", 2);

//   // console.log("response", response)
//   return new NextResponse(
//     JSON.stringify({ collectionName: "test-collection" }),
//   );
// }
