import formidable from 'formidable'

export const uploadFiles = req => new Promise((resolve, reject) => {
    const form = formidable.IncomingForm()
    form.parse(req, (err, fields, files) => {
        if (err != null) {
            reject(err)
        } else {
            resolve({ fields, files })
        }
    })
})
