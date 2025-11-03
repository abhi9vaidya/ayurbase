# Troubleshooting Guide

## Common Issues and Solutions

### 1. Database Connection Errors

#### Error: "ORA-12514: TNS:listener does not currently know of service requested in connect descriptor"

**Solution:**
- Verify OracleDB is running: `docker ps | grep oracle`
- Check connection string: `ORACLE_CONNECTION_STRING=localhost:1521/freepdb1`
- For Docker, ensure port 1521 is mapped: `-p 1521:1521`

#### Error: "ORA-01005: null password given; logon denied"

**Solution:**
- Check `.env.local` has `ORACLE_PASSWORD` set
- Verify password matches your OracleDB setup
- Don't leave password empty in environment variables

### 2. Authentication Issues

#### Error: "Invalid token" on every request

**Solution:**
- Verify `JWT_SECRET` is set in `.env.local`
- Clear browser localStorage: Open DevTools > Application > Storage > Clear All
- Try logging out and logging back in
- Check browser console for specific error messages

#### Error: "401 Unauthorized"

**Solution:**
- Token might be expired - clear cache and login again
- Check `JWT_SECRET` is consistent
- Verify `token` is being sent in Authorization header
- Check API client interceptor in `lib/api-client.ts`

### 3. Login/Registration Issues

#### Error: "Email already exists"

**Solution:**
- Use a different email address
- Check if email is already in database
- For testing, use unique emails with timestamps

#### Error: "Password too weak"

**Solution:**
- Password must be at least 8 characters
- Include mix of uppercase, lowercase, numbers
- Avoid common passwords

#### Error: "Invalid email format"

**Solution:**
- Use proper email format: `user@example.com`
- Check email validation in `lib/validation.ts`

### 4. Page Navigation Issues

#### Issue: "Redirected to login page unexpectedly"

**Solution:**
- Check if token exists: `localStorage.getItem('token')`
- Verify role is set: `localStorage.getItem('role')`
- Clear storage and login again
- Check browser console for errors

#### Issue: "404 Page Not Found"

**Solution:**
- Verify page file exists in correct directory
- Check Next.js routing matches file structure
- For `/patient/dashboard`, file should be at `app/patient/dashboard/page.tsx`
- Rebuild: `npm run dev`

### 5. API Issues

#### Error: "404 Not Found" on API call

**Solution:**
- Verify endpoint exists in `app/api/`
- Check URL matches route exactly
- Example: `/api/doctor` not `/api/doctors`
- Look at browser DevTools Network tab for full URL

#### Error: "CORS error"

**Solution:**
- This should not occur in development
- For production, configure CORS headers in API routes
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct

#### Error: "500 Internal Server Error"

**Solution:**
- Check server logs in terminal
- Verify database connection is working
- Check for SQL syntax errors
- Look at OracleDB error messages

### 6. Styling Issues

#### Colors not matching design

**Solution:**
- Check `globals.css` CSS variables
- Verify Tailwind classes are used correctly
- Clear cache: `npm run build && npm run dev`
- Check for conflicting CSS

#### Layout broken on mobile

**Solution:**
- Use responsive prefixes: `md:`, `lg:`, `sm:`
- Test with DevTools responsive mode
- Check max-width constraints
- Verify flex and grid layouts

### 7. Performance Issues

#### Application running slowly

**Solution:**
- Check for N+1 queries
- Verify database indexes exist
- Use DevTools Performance tab
- Check bundle size: `npm run build`

#### Database queries slow

**Solution:**
- Add WHERE clauses to filter results
- Limit result sets with LIMIT/OFFSET
- Check query complexity
- Consider caching frequently accessed data

### 8. Environment Variable Issues

#### Error: "process.env.VARIABLE_NAME is undefined"

**Solution:**
- Add variable to `.env.local`
- Restart dev server after changing `.env`
- For client-side access, prefix with `NEXT_PUBLIC_`
- Example: `NEXT_PUBLIC_API_BASE_URL`

#### .env.local not working

**Solution:**
- File must be in project root, not subdirectory
- Verify exact filename: `.env.local`
- Check format: `KEY=value`
- Restart dev server: `npm run dev`

### 9. Build Errors

#### Error: "Module not found"

**Solution:**
- Run `npm install` to install dependencies
- Check import paths are correct
- Use absolute imports from `@/` alias
- Verify file exists at expected location

#### Error: "TypeScript compilation failed"

**Solution:**
- Check `tsconfig.json` configuration
- Verify all imports have correct types
- Install missing type packages: `npm install @types/package-name`
- Run `npm run build` to see full errors

### 10. Browser Issues

#### Data not displaying after API call

**Solution:**
- Check API response in Network tab
- Verify state is being updated
- Look for console errors
- Check that component is calling API in useEffect

#### Infinite loops or crashes

**Solution:**
- Check useEffect dependencies
- Verify no circular logic
- Use React DevTools Profiler
- Look for console warnings

## Debug Tips

### 1. Enable Detailed Logging

Add to `lib/api-client.ts`:
\`\`\`typescript
console.log("[v0] API Request:", method, url, data);
\`\`\`

### 2. Check API Response

In browser DevTools Network tab:
- Click API endpoint
- Go to Response tab to see actual data
- Check status code (200, 401, 500, etc.)

### 3. Inspect State

Add console logs:
\`\`\`typescript
console.log("[v0] Current state:", appointments);
console.log("[v0] Error occurred:", error.message);
\`\`\`

### 4. Test Database Connection

Create test endpoint in `app/api/test/route.ts`:
\`\`\`typescript
import { executeQuery } from "@/lib/db";

export async function GET() {
  try {
    const result = await executeQuery("SELECT 1 FROM DUAL");
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
\`\`\`

## Getting Help

1. **Check Console**: Browser DevTools Console for errors
2. **Check Terminal**: Dev server terminal for server errors
3. **Check Network**: DevTools Network tab for API issues
4. **Check Storage**: DevTools Storage for token/auth issues
5. **Review Logs**: OracleDB logs for database issues

## Performance Checklist

- [ ] Database indexes created
- [ ] API responses cached where appropriate
- [ ] Images optimized
- [ ] Bundle size reasonable
- [ ] No console warnings
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms

---

**Remember**: Always check the browser console and server logs first - they usually contain the answers!
