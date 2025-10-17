<?php

namespace App\Policies;

use App\Models\Test;
use App\Models\User;

class TestPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Test $test): bool
    {
        // Admin can view all tests
        if ($user->isAdmin()) {
            return true;
        }

        // Owner can view their own tests
        if ($test->user_id === $user->id) {
            return true;
        }

        // Anyone can view public tests
        return $test->is_public;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isTeacher() || $user->isAdmin();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Test $test): bool
    {
        // Admin can update all tests
        if ($user->isAdmin()) {
            return true;
        }

        // Owner can update their own tests
        return $test->user_id === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Test $test): bool
    {
        // Admin can delete all tests
        if ($user->isAdmin()) {
            return true;
        }

        // Owner can delete their own tests
        return $test->user_id === $user->id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Test $test): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Test $test): bool
    {
        return $user->isAdmin();
    }
}