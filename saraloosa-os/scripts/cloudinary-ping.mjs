import { v2 as cloudinary } from 'cloudinary';
// CLOUDINARY_URL is auto-read from the environment (--env-file=.env)
const res = await cloudinary.api.ping();
console.log('ping:', JSON.stringify(res));
const u = await cloudinary.api.usage();
console.log('plan:', u.plan, '| credits used:', u.credits?.used_percent ?? u.credits, '| storage bytes:', u.storage?.usage);
