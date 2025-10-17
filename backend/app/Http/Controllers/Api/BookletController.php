<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookletRequest;
use App\Http\Requests\UpdateBookletRequest;
use App\Http\Resources\BookletResource;
use App\Models\Booklet;
use App\Models\Test;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookletController extends Controller
{
    /**
     * Display a listing of booklets
     */
    public function index(Request $request): JsonResponse
    {
        $query = Booklet::with(['test.user'])
            ->when($request->user()->isTeacher(), function ($q) use ($request) {
                return $q->whereHas('test', function ($testQuery) use ($request) {
                    $testQuery->where('user_id', $request->user()->id);
                });
            });

        $booklets = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => BookletResource::collection($booklets->items()),
            'meta' => [
                'current_page' => $booklets->currentPage(),
                'last_page' => $booklets->lastPage(),
                'per_page' => $booklets->perPage(),
                'total' => $booklets->total(),
            ],
        ]);
    }

    /**
     * Store a newly created booklet
     */
    public function store(StoreBookletRequest $request): JsonResponse
    {
        $test = Test::findOrFail($request->test_id);
        $this->authorize('update', $test);

        $booklet = Booklet::create([
            'test_id' => $request->test_id,
            'name' => $request->name,
            'versions' => $request->versions,
            'question_orders' => $request->question_orders,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kitapçık başarıyla oluşturuldu',
            'data' => new BookletResource($booklet->load(['test.user'])),
        ], 201);
    }

    /**
     * Display the specified booklet
     */
    public function show(Booklet $booklet): JsonResponse
    {
        $this->authorize('view', $booklet->test);

        return response()->json([
            'success' => true,
            'data' => new BookletResource($booklet->load(['test.user', 'test.questions'])),
        ]);
    }

    /**
     * Update the specified booklet
     */
    public function update(UpdateBookletRequest $request, Booklet $booklet): JsonResponse
    {
        $this->authorize('update', $booklet->test);

        $booklet->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Kitapçık başarıyla güncellendi',
            'data' => new BookletResource($booklet->load(['test.user'])),
        ]);
    }

    /**
     * Remove the specified booklet
     */
    public function destroy(Booklet $booklet): JsonResponse
    {
        $this->authorize('delete', $booklet->test);

        $booklet->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kitapçık başarıyla silindi',
        ]);
    }

    /**
     * Download booklet PDF
     */
    public function download(Booklet $booklet, Request $request): JsonResponse
    {
        $this->authorize('view', $booklet->test);

        $version = $request->query('version', 'A');

        if (!in_array($version, $booklet->versions)) {
            return response()->json([
                'success' => false,
                'message' => 'Geçersiz kitapçık versiyonu',
            ], 400);
        }

        // Increment download count
        $booklet->incrementDownloadCount();

        // Here you would generate the PDF and return download URL
        // For now, return success with mock data
        return response()->json([
            'success' => true,
            'message' => 'Kitapçık indirme hazırlandı',
            'data' => [
                'download_url' => route('booklets.pdf', ['booklet' => $booklet->id, 'version' => $version]),
                'version' => $version,
                'filename' => "Kitapcik_{$version}_{$booklet->name}.pdf",
            ],
        ]);
    }

    /**
     * Get booklets for a specific test
     */
    public function byTest(Test $test): JsonResponse
    {
        $this->authorize('view', $test);

        $booklets = $test->booklets()->latest()->get();

        return response()->json([
            'success' => true,
            'data' => BookletResource::collection($booklets),
        ]);
    }
}