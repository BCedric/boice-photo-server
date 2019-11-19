import formidable from 'formidable'

export const uploadFiles = req => new Promise((resolve, reject) => {
    const form = formidable.IncomingForm()
    form.maxFileSize = 2000 * 1024 * 1024
    form.parse(req, (err, fields, files) => {
        if (err != null) {
            reject(err)
        } else {
            resolve({ fields, files })
        }
    })
})
