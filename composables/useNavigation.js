// composables/useNavigation.js
import { computed } from 'vue'
import {
    Calendar, Heart, Users, MessageCircle, User,
    Clock, Plus, DollarSign, CreditCard, Bell, Lock
} from 'lucide-vue-next'

export const navigationItems = computed(() => [
    {
        name: 'Events',
        href: '/events',
        icon: Calendar,
        color: 'bg-gradient-to-br from-purple-500 to-pink-500',
        description: 'Discover and join community events'
    },
    {
        name: 'Donate',
        href: '/donate',
        icon: Heart,
        color: 'bg-gradient-to-br from-red-500 to-pink-500',
        description: 'Support causes that matter to you'
    },
    {
        name: 'Community',
        href: '/community',
        icon: Users,
        color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
        description: 'Connect with like-minded people'
    },
    {
        name: 'Consultations',
        href: '/consultations',
        icon: MessageCircle,
        color: 'bg-gradient-to-br from-green-500 to-teal-500',
        description: 'Get expert health advice'
    },
    {
        name: 'Profile',
        href: '/profile',
        icon: User,
        color: 'bg-gradient-to-br from-indigo-500 to-purple-500',
        description: 'Manage your account settings'
    }
])

export const useRoleSpecificActions = (user) => {
    return computed(() => {
        // Handle undefined user
        if (!user.value || !user.value.role) {
            return []
        }

        const actions = {
            user: [
                {
                    icon: MessageCircle,
                    label: 'Book Consultation',
                    path: '/consultations',
                    requiresVerification: false,
                    description: 'Get professional health advice'
                },
                {
                    icon: Heart,
                    label: 'Make Donation',
                    path: '/donate',
                    requiresVerification: false,
                    description: 'Support a cause today'
                }
            ],
            health_expert: [
                {
                    icon: Clock,
                    label: 'Pending Requests',
                    path: '/consultations',
                    requiresVerification: true,
                    description: 'Review consultation requests'
                },
                {
                    icon: MessageCircle,
                    label: 'Active Chats',
                    path: '/consultations',
                    requiresVerification: true,
                    description: 'Continue ongoing consultations'
                }
            ],
            charity: [
                {
                    icon: Plus,
                    label: 'Create Request',
                    path: '/donate/create',
                    requiresVerification: true,
                    description: 'Start a new donation campaign'
                },
                {
                    icon: DollarSign,
                    label: 'Manage Donations',
                    path: '/donate/my_request',
                    requiresVerification: true,
                    description: 'Track your donation requests'
                },
                {
                    icon: CreditCard,
                    label: 'Withdrawals',
                    path: '/withdrawals',
                    requiresVerification: true,
                    description: 'Manage your withdrawals'
                }
            ],
            community: [
                {
                    icon: Plus,
                    label: 'Create Event',
                    path: '/events/create',
                    requiresVerification: true,
                    description: 'Organize a community event'
                },
                {
                    icon: Users,
                    label: 'Manage Members',
                    path: '/community/members',
                    requiresVerification: true,
                    description: 'Manage community members'
                },
                {
                    icon: Bell,
                    label: 'Notify Members',
                    path: user.value?.id ? `/community/${user.value.id}` : '/community',
                    requiresVerification: true,
                    description: 'Send notifications to community members'
                }
            ]
        }

        // Return actions based on user role, fallback to user actions if role not found
        return actions[user.value?.role] || actions.user
    })
}

// Additional helper function to get filtered actions based on verification status
export const useFilteredActions = (user, isVerified) => {
    const roleActions = useRoleSpecificActions(user)

    return computed(() => {
        return roleActions.value.filter(action => {
            // If action doesn't require verification, always show it
            if (!action.requiresVerification) return true

            // If action requires verification, only show if user is verified
            return isVerified.value
        })
    })
}

// Helper function to check if user can access a specific path
export const useCanAccessPath = (user, isVerified) => {
    return (path) => {
        const roleActions = useRoleSpecificActions(user)
        const action = roleActions.value.find(a => a.path === path)

        if (!action) return true // If not in role-specific actions, assume accessible

        return !action.requiresVerification || isVerified.value
    }
}