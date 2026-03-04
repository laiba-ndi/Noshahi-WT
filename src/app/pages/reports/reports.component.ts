import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Dashboard, ProjectSummary, TeamWorkload } from '../../models/interfaces';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="reports-page animate-fade-in">
      <div class="page-header"><div><h1>Reports & Analytics</h1><p class="text-muted">Track performance</p></div></div>
      @if (loading) { <div class="page-loader"><div class="spinner spinner-lg"></div></div> }
      @else if (dashboard) {
        <div class="summary-grid">
          <div class="s-card glass-card"><div class="s-val" style="color:#6366f1">{{dashboard.totalProjects}}</div><div class="s-lbl">Projects</div></div>
          <div class="s-card glass-card"><div class="s-val" style="color:#3b82f6">{{dashboard.totalTasks}}</div><div class="s-lbl">Tasks</div></div>
          <div class="s-card glass-card"><div class="s-val" style="color:#10b981">{{dashboard.completedTasks}}</div><div class="s-lbl">Completed</div></div>
          <div class="s-card glass-card"><div class="s-val" style="color:#f59e0b">{{completionRate|number:'1.0-0'}}%</div><div class="s-lbl">Rate</div></div>
        </div>
        <div class="rg">
          <div class="glass-card rc">
            <h3>Project Progress</h3>
            @for(p of dashboard.projectSummaries; track p.projectId){
              <div class="br"><div class="bl">{{p.projectName}}</div><div class="bc"><div class="bf" [style.width.%]="getProg(p)"></div></div><div class="bv">{{getProg(p)|number:'1.0-0'}}%</div></div>
            }
          </div>
          <div class="glass-card rc">
            <h3>Status Overview</h3>
            @for(p of dashboard.projectSummaries; track p.projectId){
              <div class="sb"><div class="sn">{{p.projectName}}</div>
              <div class="sc"><span><i style="background:#94a3b8"></i>{{p.todoCount}} Todo</span><span><i style="background:#3b82f6"></i>{{p.inProgressCount}} Active</span><span><i style="background:#f59e0b"></i>{{p.inReviewCount}} Review</span><span><i style="background:#10b981"></i>{{p.doneCount}} Done</span></div></div>
            }
          </div>
          @if(auth.isAdminOrManager()&&teamWorkload.length){
            <div class="glass-card rc fw">
              <h3>Team Workload</h3>
              <div class="tg">
                @for(m of teamWorkload; track m.userId){
                  <div class="tc"><div class="ta" [style.background]="getAC(m.userName)">{{getIn(m.userName)}}</div><div class="tn">{{m.userName}}</div><div class="ts"><div><b>{{m.assignedItems}}</b> Active</div><div><b>{{m.completedItems}}</b> Done</div><div><b>{{m.hoursLoggedThisWeek}}h</b> Week</div></div></div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
    styles: [`
    .page-header{margin-bottom:24px} .page-header h1{font-size:24px;font-weight:800;margin-bottom:4px}
    .summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px}
    .s-card{padding:20px;text-align:center} .s-val{font-size:32px;font-weight:800;margin-bottom:4px} .s-lbl{font-size:12px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.5px}
    .rg{display:grid;grid-template-columns:1fr 1fr;gap:16px} .rc{padding:20px} .rc h3{font-size:15px;font-weight:700;margin-bottom:16px} .fw{grid-column:1/-1}
    .br{display:flex;align-items:center;gap:12px;margin-bottom:12px} .bl{width:140px;font-size:12px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis} .bc{flex:1;height:10px;background:var(--bg-glass);border-radius:var(--radius-full);overflow:hidden} .bf{height:100%;background:var(--gradient-primary);border-radius:var(--radius-full)} .bv{width:40px;text-align:right;font-size:13px;font-weight:700;color:var(--text-secondary)}
    .sb{margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--border)} .sb:last-child{border:none;margin:0;padding-bottom:0} .sn{font-size:13px;font-weight:600;margin-bottom:8px} .sc{display:flex;gap:14px;flex-wrap:wrap} .sc span{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)} .sc i{width:8px;height:8px;border-radius:50%;display:inline-block}
    .tg{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px} .tc{background:var(--bg-glass);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px;text-align:center} .ta{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;margin:0 auto 8px} .tn{font-size:13px;font-weight:600;margin-bottom:10px} .ts{display:flex;justify-content:center;gap:12px;font-size:11px;color:var(--text-secondary)} .ts b{display:block;font-size:15px;color:var(--text-primary)}
    @media(max-width:1024px){.summary-grid{grid-template-columns:repeat(2,1fr)}.rg{grid-template-columns:1fr}}
  `]
})
export class ReportsComponent implements OnInit {
    dashboard: Dashboard | null = null;
    teamWorkload: TeamWorkload[] = [];
    loading = true;
    completionRate = 0;
    constructor(private api: ApiService, public auth: AuthService) { }
    ngOnInit() {
        this.api.getDashboard().subscribe({ next: d => { this.dashboard = d; this.completionRate = d.totalTasks ? (d.completedTasks / d.totalTasks) * 100 : 0; this.loading = false; }, error: () => this.loading = false });
        if (this.auth.isAdminOrManager()) this.api.getTeamWorkload().subscribe(w => this.teamWorkload = w);
    }
    getProg(p: ProjectSummary): number { return p.totalItems ? (p.doneCount / p.totalItems) * 100 : 0; }
    getIn(n: string): string { return n.split(' ').map(x => x[0]).join('').toUpperCase().substring(0, 2); }
    getAC(n: string): string { const c = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']; let h = 0; for (let i = 0; i < n.length; i++) h = n.charCodeAt(i) + ((h << 5) - h); return c[Math.abs(h) % c.length]; }
}
