<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TeacherMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || (!$request->user()->isTeacher() && !$request->user()->isAdmin())) {
            return response()->json([
                'success' => false,
                'message' => 'Bu işlem için öğretmen yetkisi gereklidir.',
            ], 403);
        }

        return $next($request);
    }
}