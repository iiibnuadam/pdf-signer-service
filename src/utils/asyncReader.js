import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker'
GlobalWorkerOptions.workerSrc = pdfjsWorker

/**
 *
 * @param file
 */
export function readAsArrayBuffer(fileOrUrl) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    if (typeof fileOrUrl === 'string') {
      fetch(fileOrUrl)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => resolve(arrayBuffer))
        .catch(reject)
    } else {
      reader.readAsArrayBuffer(fileOrUrl)
    }
  })
}

/**
 *
 * @param src
 */
export function readAsImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    if (src instanceof Blob) {
      const url = window.URL.createObjectURL(src)
      img.src = url
    } else {
      img.setAttribute('crossOrigin', 'anonymous')
      img.src = src
    }
  })
}

/**
 *
 * @param file
 */
export function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 *
 * @param file
 */
export async function readAsPDF(file) {
  return getDocument(file).promise
}


export async function extractMetadata(url) {
  const pdf = await getDocument(url).promise
  const metadata = await pdf.getMetadata()
  return {
    ...metadata,
    metadata: metadata?.metadata?.getAll(),
  }
}