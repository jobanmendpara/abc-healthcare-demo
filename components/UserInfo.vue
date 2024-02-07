<script setup lang="ts">
import type { User } from '~/types';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Object as PropType<User>,
    default: () => initUser(),
  },
});

const emit = defineEmits(['deleteUser', 'update:open', 'update:user']);

const { $toast } = useNuxtApp();
const { copy, email, isOpen } = useDialog();

function useDialog() {
  const isOpen = useVModel(props, 'open', emit);

  function copy(value: string) {
    navigator.clipboard.writeText(value);
    $toast.success('Copied to clipboard');
  };

  function email(email: string) {
    window.open(`mailto:${email}`);
  }

  return {
    copy,
    email,
    isOpen,
  };
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {{ `${props.user.last_name}, ${props.user.first_name}` }}
        </DialogTitle>
        <DialogDescription>
          <div
            class="inline-flex items-center gap-2 hover:cursor-pointer"
            @click="copy(user.id)"
          >
            <p>
              <b>ID:</b> {{ user.id }}
            </p>
            <Icon name="ph:copy" />
          </div>
        </DialogDescription>
      </DialogHeader>
      <div>
        <div class="flex items-center gap-2">
          <b>Email: </b>
          <div
            class="inline-flex items-center gap-2 hover:cursor-pointer"
            @click="copy(user.email)"
          >
            <p>{{ user.email }}</p>
            <Icon
              name="ph:copy"
            />
          </div>
          <div class="hover:cursor-pointer">
            <Icon
              name="ph:envelope"
              @click="email(user.email)"
            />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <b>Phone: </b>
          <div
            class="inline-flex items-center gap-2 hover:cursor-pointer"
            @click="copy(user.phone_number)"
          >
            <p>{{ formatToPhone(user.phone_number) }}</p>
            <Icon
              name="ph:copy"
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <AlertDialog>
          <AlertDialogTrigger>
            <Button variant="destructive">
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action is permanent. You cannot undo this action.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction @click="$emit('deleteUser', user.id)">
                Delete User
              </AlertDialogAction>
              <AlertDialogCancel>
                Cancel
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
