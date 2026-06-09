<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view the profile.
     */
    public function view(User $user, User $model): bool
    {
        return $user->id === $model->id;
    }

    /**
     * Determine whether the user can update the profile.
     */
    public function update(User $user, User $model): bool
    {
        return $user->id === $model->id;
    }
}
