import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { WebsocketService } from '../../websocket.service';
import { Subscription, catchError, of } from 'rxjs';
import { ReviewService } from './review.service';
import { ToastService } from '../../../../core/toast.service';

interface Interaction {
  likes: number;
  dislikes: number;
  userLiked: boolean;
  userDisliked: boolean;
}

interface Comment extends Interaction {
  id: number;
  author: string;
  text: string;
  timestamp: Date;
  owned: boolean;
  replies: Reply[];
  isEditing?: boolean;
}

interface Reply extends Interaction {
  id: number;
  author: string;
  text: string;
  timestamp: Date;
  owned: boolean;
  isEditing?: boolean;
}

@Component({
  selector: 'ccnta-review',
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss',
})
export class ReviewComponent implements OnInit, OnDestroy {
  comments: any[];
  // [
  //   {
  //     id: 1,
  //     author: 'John Doe',
  //     text: 'This is an example comment. Very insightful and engaging content!',
  //     timestamp: new Date('2024-01-10T10:00:00'),
  //     owned: true,
  //     likes: 5,
  //     dislikes: 0,
  //     userLiked: false,
  //     userDisliked: false,
  //     isEditing: false,
  //     replies: [
  //       {
  //         id: 1,
  //         author: 'Jane Smith',
  //         text: 'Thank you for your comment! I completely agree.',
  //         timestamp: new Date('2024-01-10T11:00:00'),
  //         owned: false,
  //         likes: 3,
  //         dislikes: 0,
  //         userLiked: false,
  //         userDisliked: false,
  //       },
  //     ],
  //   },
  // ];

  newComment = '';
  newReply: { [commentId: number]: string } = {};
  editingComment: { [commentId: number]: string } = {};
  isEditMode = false;
  editingCommentId: number | null = null;
  editingReplyData: { commentId: number; replyId: number } | null = null;
  @Input('noteId') noteId: string;
  private reviewSubscription: Subscription = null;
  private websocketSub: Subscription | null = null;
  private _websocketService: WebsocketService = inject(WebsocketService);
  private _reviewService: ReviewService = inject(ReviewService);
  private readonly _toastService: ToastService = inject(ToastService);

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subscribeToCommentUpdates();
    this.subscribeToComments();
    this.initializeWebSocketConnection();
  }

  ngOnDestroy(): void {
    this.reviewSubscription.unsubscribe();
    this.websocketSub?.unsubscribe();
  }

  // get sortedComments(): Comment[] {
  //   return this.comments.sort((a, b) => {
  //     const latestA = this.getLatestActivityTime(a);
  //     const latestB = this.getLatestActivityTime(b);
  //     return latestB.getTime() - latestA.getTime();
  //   });
  // }

  private getLatestActivityTime(comment: Comment): Date {
    const replyTimes = comment.replies.map((reply) => reply.timestamp);
    const allTimes = [comment.timestamp, ...replyTimes];
    return new Date(Math.max(...allTimes.map((t) => t.getTime())));
  }

  postComment(): void {
    // If in edit mode, update existing comment
    if (this.isEditMode && this.editingCommentId !== null) {
      const commentToEdit = this.comments.find(
        (c) => c.id === this.editingCommentId
      );
      if (commentToEdit) {
        commentToEdit.text = this.newComment;
        commentToEdit.timestamp = new Date();

        // Reset edit mode
        this.isEditMode = false;
        this.editingCommentId = null;
      }
    } else {
      // Regular new comment creation
      if (this.newComment.trim() === '') return;

      const request = {
        entity: 'NOTE',
        entityId: this.noteId,
        text: this.newComment,
      };

      this._reviewService.addComment(request).subscribe({
        next: () => {
          this._toastService.show('Comment posted successfully', 'SUCCESS', null);
        },
        error: (error) => {
          this._toastService.show(error.error.message, 'DANGER', null);
        },
      });
    }

    // Clear the input
    this.newComment = '';
  }

  editComment(comment: Comment): void {
    // Set edit mode
    this.isEditMode = true;
    this.editingCommentId = comment.id;

    // Populate the input with existing comment text
    this.newComment = comment.text;
  }

  deleteComment(comment: Comment): void {
    this.comments = this.comments.filter((c) => c.id !== comment.id);
  }

  // Rest of the methods remain the same as in the previous implementation
  handleCommentInteraction(comment: Comment, type: 'like' | 'dislike'): void {
    if (type === 'like') {
      if (comment.userLiked) {
        comment.likes--;
        comment.userLiked = false;
      } else {
        if (comment.userDisliked) {
          comment.dislikes--;
          comment.userDisliked = false;
        }

        comment.likes++;
        comment.userLiked = true;
      }
    } else {
      if (comment.userDisliked) {
        comment.dislikes--;
        comment.userDisliked = false;
      } else {
        if (comment.userLiked) {
          comment.likes--;
          comment.userLiked = false;
        }

        comment.dislikes++;
        comment.userDisliked = true;
      }
    }
  }

  // Other methods (replyToComment, handleReplyInteraction, etc.) remain the same
  replyToComment(comment: Comment): void {
    const replyText = this.newReply[comment.id];
    if (!replyText || replyText.trim() === '') return;

    // Check if we're in edit mode for a reply
    if (this.editingReplyData) {
      // Find the specific reply to edit
      const commentToEdit = this.comments.find(
        (c) => c.id === this.editingReplyData!.commentId
      );
      const replyToEdit = commentToEdit?.replies.find(
        (r) => r.id === this.editingReplyData!.replyId
      );

      if (replyToEdit) {
        replyToEdit.text = replyText;
        replyToEdit.timestamp = new Date();
        replyToEdit.isEditing = false;
      }

      // Reset editing state
      this.editingReplyData = null;
    } else {
      // Regular reply creation
      // comment.replies.push({
      //   id: Date.now(),
      //   author: 'You',
      //   text: replyText,
      //   timestamp: new Date(),
      //   owned: true,
      //   likes: 0,
      //   dislikes: 0,
      //   userLiked: false,
      //   userDisliked: false,
      //   isEditing: false,
      // });
    }

    // Clear the reply input
    this.newReply[comment.id] = '';
  }

  shareComment(comment: Comment): void {
    const shareText = `Check out this comment: "${comment.text}" by ${comment.author}`;

    if (navigator.share) {
      navigator
        .share({
          title: 'Shared Comment',
          text: shareText,
        })
        .catch(console.error);
    } else {
      navigator.clipboard
        .writeText(shareText)
        .then(() => alert('Comment copied to clipboard!'))
        .catch((err) => console.error('Could not copy text: ', err));
    }
  }

  // Unified like/dislike logic for replies
  handleReplyInteraction(
    reply: Reply,
    comment: Comment,
    type: 'like' | 'dislike'
  ): void {
    if (type === 'like') {
      // If already liked, unlike
      if (reply.userLiked) {
        reply.likes--;
        reply.userLiked = false;
      } else {
        // If previously disliked, remove dislike
        if (reply.userDisliked) {
          reply.dislikes--;
          reply.userDisliked = false;
        }

        // Add like
        reply.likes++;
        reply.userLiked = true;
      }
    } else {
      // dislike
      // If already disliked, undislike
      if (reply.userDisliked) {
        reply.dislikes--;
        reply.userDisliked = false;
      } else {
        // If previously liked, remove like
        if (reply.userLiked) {
          reply.likes--;
          reply.userLiked = false;
        }

        // Add dislike
        reply.dislikes++;
        reply.userDisliked = true;
      }
    }
  }

  editReply(reply: Reply, comment: Comment): void {
    // Set the reply text in the reply input for the specific comment
    this.newReply[comment.id] = reply.text;

    // Store which reply is being edited
    this.editingReplyData = {
      commentId: comment.id,
      replyId: reply.id,
    };

    // Optional: You could also set a flag on the reply itself
    reply.isEditing = true;
  }

  deleteReply(reply: Reply, comment: Comment): void {
    comment.replies = comment.replies.filter((r) => r.id !== reply.id);
  }

  private initializeWebSocketConnection(): void {
    // Connect to WebSocket
    this._websocketService
      .connect()
      .then(() => {
        this._websocketService.joinReview(this.noteId);

        // Subscribe to WebSocket notifications
        this.websocketSub = this._websocketService.getReview().subscribe({
          next: (comment: any) => {
            this._reviewService.addWebsocketComment(comment);
          },
          error: (error) =>
            console.error('WebSocket notification error:', error),
        });
      })
      .catch((error) => {
        console.error('WebSocket connection error:', error);
      });
  }

  private subscribeToCommentUpdates = () => {
    this.reviewSubscription = this._reviewService.comments$.subscribe({
      next: (comments: any[]) => {
        const userEmail = localStorage.getItem('email');

        if (comments.length > 0) {
          this._toastService.show('New comment arrived.', 'SUCCESS', null);
        }

        // Map through comments and set `owned` dynamically
        this.comments = comments.map((comment) => {
          comment.owned = comment.author.email === userEmail;
          return comment;
        });
      },
      error: (error) => {
        console.error('Error in comment subscription:', error);
      },
    });
  };

  private subscribeToComments = () => {
    this._reviewService
      .getComments(this.noteId)
      .pipe(
        catchError((error) => {
          console.error(error.error.message, error);
          this._toastService.show(error.error.message, 'DANGER', null);
          return of([]);
        })
      )
      .subscribe();
  };
}
